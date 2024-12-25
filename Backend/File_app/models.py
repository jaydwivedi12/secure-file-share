from django.db import models
from django.conf import settings
import uuid

class ServerKeyPair(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    private_key = models.BinaryField()
    public_key = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=['is_active', 'expires_at'])]

class EncryptedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    encrypted_data = models.BinaryField()  # Server-side encrypted data
    client_iv = models.BinaryField()       # IV used for client-side encryption
    server_iv = models.BinaryField()       # IV used for server-side encryption
    server_key = models.BinaryField()      # Key used for server-side encryption
    client_key = models.BinaryField()      # Key used for client-side encryption
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['filename'])
        ]
