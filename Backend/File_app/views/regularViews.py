from datetime import datetime, timedelta, timezone
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from ..services import KeyManagementService, FileEncryptionService
from ..models import EncryptedFile,SharedFile,ShareableLink
import base64
import json

User = get_user_model()

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
        
        # Retrieve the encrypted file record from the database
        encrypted_file = EncryptedFile.objects.get(id=file_id)

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
        encrypted_file = EncryptedFile.objects.get(id=file_id)
        if request.user!= encrypted_file.user and not request.user.is_staff:
            return JsonResponse({"success": False, "message": 'You do not have permission to delete this file.'}, status=403)
        encrypted_file.delete()
        return JsonResponse({"success":True,"message":"File deleted successfully!"},status=200)
    except Exception as e:
        return JsonResponse({"succes":False, "message": str(e)}, status=500)
    


@api_view(['PUT'])
def update_permissions(request, file_id):
    try:
        data = json.loads(request.body)
        view_emails = data.get('view_email', [])
        download_emails = data.get('download_email', [])

        
        # Check if the current user has permission to update permissions
       
        if not file_id:
            return JsonResponse({"success": False, "message": 'file_id is required.'}, status=400)
        if not view_emails and not download_emails:
            return JsonResponse({"success": False, "message": 'At least one of view_email or download_email is required.'}, status=400)

        # Get the shared file
        try:
            encrypted_file = EncryptedFile.objects.get(id=file_id) 
        except EncryptedFile.DoesNotExist:
            return JsonResponse({"success": False, "message": "EncryptedFile not found."}, status=404)
        
        if request.user != encrypted_file.user and not request.user.is_staff: 
            return JsonResponse({"success": False, "message": 'You do not have permission to update permissions.'}, status=403)
        
      
        shared_file,created = SharedFile.objects.get_or_create(
            encrypted_file=encrypted_file, 
            defaults={'owner': request.user}
        )
    
        valid_view_users = User.objects.filter(email__in=view_emails)
        invalid_view_emails = list(set(view_emails) - set(valid_view_users.values_list('email', flat=True)))

        valid_download_users = User.objects.filter(email__in=download_emails)
        invalid_download_emails = list(set(download_emails) - set(valid_download_users.values_list('email', flat=True)))

        # Use atomic transaction for consistency
        with transaction.atomic():
            shared_file.view_permission.clear()
            shared_file.download_permission.clear()
            shared_file.view_permission.add(*valid_view_users)
            shared_file.download_permission.add(*valid_download_users)

        return JsonResponse({
            "success": True,
            'message': 'Permissions updated successfully.',
            'invalid_view_emails': invalid_view_emails,
            'invalid_download_emails': invalid_download_emails,
            'added_view_users': list(valid_view_users.values_list('email', flat=True)),
            'added_download_users': list(valid_download_users.values_list('email', flat=True)),
        })

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
    

@api_view(['GET'])
def get_shared_files(request):
    user_email = request.user

    try:
        shared_files = SharedFile.objects.filter(
            view_permission__email__in=[user_email]
        ).prefetch_related('encrypted_file') 

        formatted_data = [
            {
                'id': str(shared_file.encrypted_file.id), 
                'name': shared_file.encrypted_file.filename,  
                'size':shared_file.encrypted_file.file_size, 
                'type': shared_file.encrypted_file.content_type,
                'permission': 'view' if shared_file.view_permission.filter(email=user_email).exists() else 'download' if shared_file.download_permission.filter(email=user_email).exists() else None,
            }
            for shared_file in shared_files
        ]

        return JsonResponse({"success":True,"files":formatted_data}, status=200)

    except Exception as e:
        print(f"Error retrieving shared files: {e}")
        return JsonResponse({'error': str(e)}, status=200)
    


@api_view(['GET'])
def get_permissions(request,file_id):
    try:
       
        shared_file = SharedFile.objects.get(encrypted_file__id=file_id)
        view_permission = shared_file.view_permission.all()
        download_permission = shared_file.download_permission.all()
        return JsonResponse({
            "success": True,
            'view_permission': list(view_permission.values_list('email', flat=True)),
            'download_permission': list(download_permission.values_list('email', flat=True)),
        })
    except SharedFile.DoesNotExist:
        return JsonResponse({"success": False, "message": "SharedFile not found."}, status=204)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@api_view(['POST'])
def generate_share_url(request, file_id):
    if request.method == 'POST':
        try:
            # Parse the incoming data
            data = json.loads(request.body)
            expires_at = data.get('expiryDate')
            max_downloads = data.get('maxDownloads')

            # Validate expiryDate: it should be a valid datetime string
            if not expires_at:
                return JsonResponse({"success": False, "message": "expiryDate is required."}, status=400)

            try:
                expires_at = expires_at + " 23:59:59"
                print(expires_at)
                # Convert expiryDate to a datetime object
                expires_at = datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S")
            except Exception as e:
                return JsonResponse({"success": False,"message":str(e)},status=400)
            

            # Validate maxDownloads: it should be an integer
            if not isinstance(max_downloads, int) or max_downloads <= 0:
                return JsonResponse({"success": False, "message": "maxDownloads should be a positive integer."}, status=400)

            # Check if the EncryptedFile exists and belongs to the user
            try:
                file = EncryptedFile.objects.get(id=file_id, user=request.user)
            except EncryptedFile.DoesNotExist:
                return JsonResponse({"success": False, "message": "EncryptedFile not found."}, status=404)

            # Create the ShareableLink object
            share_link = ShareableLink.objects.create(
                file=file,
                created_by=request.user,
                expires_at=expires_at,
                max_downloads=max_downloads
            )

            # Return the response with share URL, expiry date, and max downloads
            return JsonResponse({
                "success": True,
                'share_url': f"/share/{share_link.id}",
                'expires_at': expires_at.strftime("%Y-%m-%d %H:%M:%S"),
                'max_downloads': max_downloads
            }, status=200)
        
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

@api_view(['DELETE'])
def delete_shareable_link(request, share_link_id):
    try:
        # Validate shareLinkId: it should be a positive integer
        if not share_link_id :
            return JsonResponse({"success": False, "message": "shareLinkId is required."}, status=400)

        # Check if the ShareableLink exists and belongs to the user
        try:
            share_link = ShareableLink.objects.get(id=share_link_id, created_by=request.user)
        except ShareableLink.DoesNotExist:
            return JsonResponse({"success": False, "message": "ShareableLink not found."}, status=404)

        share_link.delete()

        return JsonResponse({"success": True, "message": "ShareableLink deleted successfully."}, status=200)
    
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
    



@api_view(['GET']) 
def get_user_share_links(request):
    try:
        # Fetch all ShareableLink objects created by the current user
        share_links = ShareableLink.objects.filter(created_by=request.user)

        # Serialize the data
        data = []
        for link in share_links:
            data.append({
                'link_id': str(link.id),
                'file_id': str(link.file.id), 
                'file_name': link.file.filename, 
                'file_size': link.file.file_size, 
                'expires_at': link.expires_at.strftime("%Y-%m-%d %H:%M:%S"),
                'max_downloads': link.max_downloads,
                'download_count': link.download_count,
                'is_active': link.is_active,
                'created_at': link.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })

        # Return the response
        return JsonResponse({
            "success": True,
            "files": data
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)
