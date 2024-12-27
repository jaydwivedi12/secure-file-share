from django.db import models
from django.conf import settings
from datetime import datetime
import uuid
import pytz


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


class SharedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_files')
    encrypted_file = models.ForeignKey(EncryptedFile, on_delete=models.CASCADE)
    view_permission = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='viewable_files')
    download_permission = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='downloadable_files')

    def __str__(self):
        return f"SharedFile {self.id} owned by {self.owner}"



class ShareableLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    file = models.ForeignKey('EncryptedFile', on_delete=models.CASCADE)  
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    max_downloads = models.IntegerField(null=True)
    download_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['expires_at', 'is_active']),
            models.Index(fields=['file', 'created_at']),
        ]

    def increment_download_count(self):
        """
        Increments the download count 
        """
        self.download_count += 1
        self.save()  # Save the updated model if not deleted


    def save(self, *args, **kwargs):
        """
        Override the save method to handle expiration logic automatically.
        """
        # Make sure self.expires_at is timezone-aware if it isn't already
        if self.expires_at.tzinfo is None:
            self.expires_at = pytz.utc.localize(self.expires_at)  # Localize to UTC or your desired timezone

        # Make sure current time is timezone-aware
        current_time = datetime.now(pytz.utc)

        # Automatically deactivate expired links
        if self.expires_at < current_time:
            self.is_active = False

        super().save(*args, **kwargs)
