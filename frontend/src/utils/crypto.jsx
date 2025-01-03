import api from "../services/apiConfig";

class SecureFileCrypto {
    static async getServerPublicKey() {
      const response = await api.get('/file/get-public-key/');
      
      const { key_id, public_key } = await response.data;
      
      // Import the public key
      const importedKey = await crypto.subtle.importKey(
        'spki',
        this.pemToArrayBuffer(public_key),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['encrypt']
      );
      
      return { key_id, publicKey: importedKey };
    }
  
    static async uploadFile(file) {
      // Get server's public key
      const { key_id, publicKey } = await this.getServerPublicKey();
      
      // Generate AES key for file encryption
      const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt file
      const fileBuffer = await file.arrayBuffer();
      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        fileBuffer
      );
      
      // Export and encrypt AES key with server's public key
      const exportedKey = await crypto.subtle.exportKey('raw', aesKey);
      const encryptedKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        exportedKey
      );
      
      // Prepare form data
      const formData = new FormData();
      formData.append('key_id', key_id);
      formData.append('encrypted_file', new Blob([encryptedContent]));
      formData.append('encrypted_key', new Blob([encryptedKey]));
      formData.append('iv', new Blob([iv]));
      formData.append('filename', file.name);
      formData.append('content_type', file.type);

      console.log(file.type);
      
      
      // Upload to server
      const response = await api.post('/file/upload-file/', formData);
      
      return response.data;
    }
  
    static async generateDownloadKeyPair() {
      return await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );
    }
  
    static async downloadFile(fileId) {
      // Generate key pair for secure download
      const keyPair = await this.generateDownloadKeyPair();
      
      // Export public key
      const exportedPublicKey = await crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
      );
      
      // Request download
      const response = await api.post(`/file/download-file/${fileId}/`, {
        client_public_key: this.arrayBufferToPem(exportedPublicKey)
      });
      
      
      const {
        encrypted_file,
        encrypted_key,
        iv,
        filename,
        content_type
      } = await response.data;
  
      const encryptedKeyBuffer = this.base64ToArrayBuffer(encrypted_key);
      const encryptedFileBuffer = this.base64ToArrayBuffer(encrypted_file);
      const decodediv=this.base64ToArrayBuffer(iv);

      // Decrypt the AES key
      const decryptedKeyBuffer = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        keyPair.privateKey,
        encryptedKeyBuffer
      );

      // Import the AES key
      const aesKey = await crypto.subtle.importKey(
        'raw',
        decryptedKeyBuffer,
        'AES-GCM',
        true,
        ['decrypt']
      );
      
      // Decrypt the file
      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(decodediv) },
        aesKey,
        encryptedFileBuffer
      );

     const blob = new Blob([decryptedContent], { type: content_type });
     return blob
    }
  
    // Utility methods for PEM conversion
    static pemToArrayBuffer(pem) {
      const base64 = pem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '');
      return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    }
  
    static arrayBufferToPem(buffer) {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`;
    }

    
    static base64ToArrayBuffer(base64) {
      // Remove Base64 URL encoding if it exists (optional, depending on your input format)
      const base64String = base64.replace(/\-/g, '+').replace(/_/g, '/');
    
      // Decode the Base64 string into a binary string using `atob`
      const binaryString = atob(base64String);
    
      // Create a new ArrayBuffer and fill it with the binary data
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
    
      // Fill the Uint8Array with the decoded binary data
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
    
      return arrayBuffer;
    }
      
    
  }


export default SecureFileCrypto;
