from django.contrib import admin
from .models import User
# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'last_login')
    search_fields = ('email', 'role')
    list_filter = ('role', 'last_login')