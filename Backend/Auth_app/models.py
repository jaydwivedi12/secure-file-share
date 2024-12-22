from django.contrib.auth.models import AbstractUser, BaseUserManager
import pyotp
from django.db import models
import qrcode


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        user = self.create_user(email, password, **extra_fields)
        
        # Generate 2FA secret for the superuser and print the TOTP URI
        user.generate_2fa_secret()
        print(f"2FA Key for ({email}): {user.two_factor_secret}")

        totp_uri = pyotp.totp.TOTP(user.two_factor_secret).provisioning_uri(
            name=user.email,
            issuer_name="Secure File Sharing App"
        )
        print(f"2FA TOTP URI for the superuser: {totp_uri}")
        # Generate the QR code
        qr = qrcode.make(totp_uri)
        # Display QR code
        qr.show()

        return user
        
class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = None
    first_name=None
    last_name=None
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('regular', 'Regular User'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='regular')
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
    def generate_2fa_secret(self):
        """
        Generate a new 2FA secret for the user.
        """
        if not self.two_factor_secret:
            self.two_factor_secret = pyotp.random_base32()
            self.save()
        return self.two_factor_secret
    
    