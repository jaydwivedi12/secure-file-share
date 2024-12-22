from django.urls import path
from . import views 

urlpatterns = [
    path('register/',views.register,name='register'),
    path('login/',views.login,name='login'),
    path('verify2fa/',views.verify_2fa,name='verify2fa'),
]
