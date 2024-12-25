from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from datetime import timedelta
from django.utils import timezone
import os
from .models import ServerKeyPair


class KeyManagementService:
    @staticmethod
    def generate_key_pair():
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        
        # Serialize keys
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        key_pair = ServerKeyPair.objects.create(
            private_key=private_pem,
            public_key=public_pem,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        return key_pair

    @staticmethod
    def get_private_key(key_pair_id):
        key_pair = ServerKeyPair.objects.get(
            id=key_pair_id,
            is_active=True,
            expires_at__gt=timezone.now()
        )
        return serialization.load_pem_private_key(
            key_pair.private_key,
            password=None
        )

class FileEncryptionService:
    @staticmethod
    def encrypt_for_storage(data):
        key = AESGCM.generate_key(bit_length=256)
        aesgcm = AESGCM(key)
        iv = os.urandom(12)
        encrypted_data = aesgcm.encrypt(iv, data, None)
        return encrypted_data, key, iv

    @staticmethod
    def decrypt_from_storage(encrypted_data, key, iv):
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(iv, encrypted_data, None)
