from django.urls import path
from File_app.views import adminViews, regularViews,guestViews

urlpatterns = [
    path('get-public-key/', regularViews.get_public_key),
    path('upload-file/', regularViews.upload_file),
    path('download-file/', regularViews.download_file),
]
