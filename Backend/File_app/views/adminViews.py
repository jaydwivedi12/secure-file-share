from ..models import EncryptedFile,ShareableLink
from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(["GET"])
def get_all_users_files(request):
    try:
        if not request.user.is_staff:
            return JsonResponse({
                'success': False,
                'message':"Admin Authentication Required"
            },status=403)
        
        encrypted_files = EncryptedFile.objects.all()
        files = []
        for file in encrypted_files:
            files.append({
                'file_id': str(file.id),
                'user_email': file.user.email, 
                'filename': file.filename,
                'content_type': file.content_type,
                'file_size': file.file_size,
                'uploaded_at': file.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            })
        return JsonResponse({
            'success': True,
            'files': files
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)
    

@api_view(["GET"])
def get_all_share_links(request):
    try:
        if not request.user.is_staff:
            return JsonResponse({
                'success': False,
                'message':"Admin Authentication Required"
            },status=403)
        
        share_links = ShareableLink.objects.all()
        data = []
        for link in share_links:
            data.append({
                    'link_id': str(link.id),
                    'file_id': str(link.file.id), 
                    'file_name': link.file.filename, 
                    'shared_by':str(link.created_by),
                    'file_size': link.file.file_size, 
                    'expires_at': link.expires_at.strftime("%Y-%m-%d %H:%M:%S"),
                    'max_downloads': link.max_downloads,
                    'download_count': link.download_count,
                    'is_active': link.is_active,
                    'created_at': link.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return JsonResponse({
            'success': True,
            'share_links': data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)