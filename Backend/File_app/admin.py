from django.contrib import admin
from .models import ServerKeyPair, EncryptedFile,SharedFile
# Register your models here.
@admin.register(ServerKeyPair)
class ServerKeyPairAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'expires_at', 'is_active')
    list_filter = ('is_active', 'expires_at')
    search_fields = ('id',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'expires_at')

@admin.register(EncryptedFile)
class EncryptedFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'filename', 'content_type', 'file_size', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('filename',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at')
    autocomplete_fields = ('user',)
    list_select_related = ('user',)


@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'encrypted_file_id')
    filter_horizontal = ('view_permission', 'download_permission')