from django.urls import path
from File_app.views import adminViews, regularViews,guestViews

urlpatterns = [
    path('get-public-key/', regularViews.get_public_key),
    path('upload-file/', regularViews.upload_file),
    path('download-file/<uuid:file_id>/', regularViews.download_file),
    path('get-all-files/', regularViews.get_all_files),
    path('delete-file/<uuid:file_id>/', regularViews.delete_file),
    path('update-permisssions/<uuid:file_id>/', regularViews.update_permissions),
    path('get-permissions/<uuid:file_id>/', regularViews.get_permissions),
    path('get-shared-files/', regularViews.get_shared_files),
    path('generate-share-url/<uuid:file_id>/', regularViews.generate_share_url),
    path('delete_shareable_link/<uuid:share_link_id>/', regularViews.delete_shareable_link),
    path('get-user-share-links/',regularViews.get_user_share_links),



    path('get-public-share-url-info/<uuid:id>/',guestViews.get_public_share_url_info),


    path('get-all-users-files/',adminViews.get_all_users_files),
]
