from django.urls import path
from . import views 

urlpatterns = [
    path('register/',views.register,name='register'),
    path('login/',views.login,name='login'),
    path('logout/',views.logout,name='logout'),
    path('change-password/',views.change_password),
    path('verify2fa/',views.verify_2fa,name='verify2fa'),

    path('verify-token/',views.verify_token_or_verify_refresh,name='verify_token_or_verify_refresh'),  

    #for admin
    path('get-all-users/',views.get_all_users),
    path('delete-user/<str:email>/',views.delete_user),

]
