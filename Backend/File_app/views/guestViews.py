from django.http import JsonResponse
from ..models import ShareableLink
from rest_framework.decorators import api_view, permission_classes



@api_view(['GET'])
@permission_classes([])
def get_public_share_url_info(request, id):
    try:
        # Fetch the ShareableLink object by its id
        print(id)
        share_link = ShareableLink.objects.get(id=id)
        share_link.increment_download_count()
        share_link.save() 
        # Access related file information (assuming 'file' is a ForeignKey to EncryptedFile)
        file = share_link.file

        # Prepare the response data
        response_data = {
            'file_id':file.id,
            'file_name': file.filename,  
            'file_size': file.file_size,
            'type': file.content_type,
            'created_by': str(share_link.created_by), 
            'created_at': share_link.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

        if share_link.max_downloads is not None and share_link.download_count > share_link.max_downloads:
            try:
                share_link.delete()
            except Exception as e:
                print(f"Error deleting ShareableLink: {str(e)}")  
            return JsonResponse({
                "success": False,
                "message": "Download limit reached. Shareable link has been deleted."
            }, status=403)
        
        return JsonResponse({
            "success": True,
            "file": response_data
        }, status=200)
        
    except ShareableLink.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Shareable link not found."
        }, status=404)

    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)
