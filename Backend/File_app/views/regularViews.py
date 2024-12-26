from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from ..services import KeyManagementService, FileEncryptionService
from ..models import EncryptedFile
import base64
import json


@api_view(['GET'])
def get_public_key(request):
    key_pair = KeyManagementService.generate_key_pair()
    return JsonResponse({
        'key_id': str(key_pair.id),
        'public_key': key_pair.public_key.decode()
    },status=200)


@api_view(['POST'])
def upload_file(request):
    key_pair_id = request.POST.get('key_id')
    encrypted_file = request.FILES.get('encrypted_file').read()
    encrypted_key = request.FILES.get('encrypted_key').read()
    client_iv = request.FILES.get('iv').read()
    try:
        # Get the private key to decrypt the client's AES key
        private_key = KeyManagementService.get_private_key(key_pair_id)
        
        # Decrypt the client's AES key
        client_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Encrypt for storage using server-side encryption
        encrypted_data, server_key, server_iv = FileEncryptionService.encrypt_for_storage(encrypted_file)
        
        # Store encrypted file and metadata
        encrypted_file = EncryptedFile.objects.create(
            user=request.user,
            filename=request.POST.get('filename'),
            content_type=request.POST.get('content_type'),
            file_size=request.FILES.get('encrypted_file').size,
            encrypted_data=encrypted_data,
            client_iv=client_iv,
            server_iv=server_iv,
            server_key=server_key,
            client_key=client_key,
        )
        
        return JsonResponse({"succes":True, "message":"File upload Successfully!",'file_id': str(encrypted_file.id)},status=200)
    except Exception as e:
        return JsonResponse({"succes":False, "message": str(e)}, status=500)
    


@api_view(['POST'])
def download_file(request, file_id):
    try:
        # Parse client's public key from request
        client_public_key = serialization.load_pem_public_key(
            json.loads(request.body)['client_public_key'].encode()
        )
        print(file_id)
        
        # Retrieve the encrypted file record from the database
        encrypted_file = EncryptedFile.objects.get(id=file_id, user=request.user)

        # Decrypt the server-encrypted file
        decrypted_data = FileEncryptionService.decrypt_from_storage(
            encrypted_file.encrypted_data,
            key=encrypted_file.server_key,
            iv=encrypted_file.server_iv
        )
        
        # Re-encrypt the AES key for the client using the client's public key
        encrypted_key_for_client = client_public_key.encrypt(
            encrypted_file.client_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Send the decrypted file and re-encrypted key
        return JsonResponse({
            'success':True,
            'encrypted_file': base64.b64encode(decrypted_data).decode(),  # Base64-encoded binary data
            'encrypted_key': base64.b64encode(encrypted_key_for_client).decode(),
            'iv': base64.b64encode(encrypted_file.client_iv).decode(),
            'filename': encrypted_file.filename,
            'content_type': encrypted_file.content_type
        },status=200)
    except Exception as e:
        return JsonResponse({"succes":False, "message": str(e)}, status=500)

@api_view(['GET'])
def get_all_files(request):
    try:
        encrypted_files = EncryptedFile.objects.filter(user=request.user)
        files = []
        for file in encrypted_files:
            files.append({
                'file_id': str(file.id),
                'filename': file.filename,
                'content_type': file.content_type,
                'file_size': file.file_size,
                'uploaded_at': file.created_at,
            })
        return JsonResponse({"success":True,"data":files},status=200)
    except Exception as e:
        return JsonResponse({"succes":False, "message": str(e)}, status=500)
    

@api_view(['DELETE'])
def delete_file(request, file_id):
    try:
        encrypted_file = EncryptedFile.objects.get(id=file_id, user=request.user)
        encrypted_file.delete()
        return JsonResponse({"success":True,"message":"File deleted successfully!"},status=200)
    except Exception as e:
        return JsonResponse({"succes":False, "message": str(e)}, status=500)