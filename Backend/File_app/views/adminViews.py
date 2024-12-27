from ..models import EncryptedFile
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