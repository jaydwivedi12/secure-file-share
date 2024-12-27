from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie,csrf_protect
from django.middleware.csrf import get_token
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.decorators import api_view,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import User
from.serializers import UserSerializer
import pyotp

@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([])  # Allow non-authenticated users to register
def register(request):
    """
    Handles user registration.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return JsonResponse({"success": False,"message":"Email and password are required."}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({"success": False,"message": "Email is already registered."}, status=400)
    
    try:
        # Create the user
        user = User.objects.create(
            email=email,
            password=make_password(password),  # Hash the password before saving
        )
        
        # Generate 2FA secret for the user
        user.generate_2fa_secret()

        totp_uri = pyotp.totp.TOTP(user.two_factor_secret).provisioning_uri(
            name=user.email,
            issuer_name="Secure File Sharing App"
        )

        response= JsonResponse({
            "success": True,
            "message": "User registered successfully.",
            "twoFA_setup": {
                "email": email,
                "totp_uri": totp_uri, 
            }
        }, status=201)
        csrf_token = get_token(request)
        response.set_cookie("csrftoken",csrf_token)

        return response

    except Exception as e:
        return JsonResponse({"success": False,"message": str(e)}, status=500)



@api_view(['POST'])
@permission_classes([]) #Allow non-authenticated users to login
def login(request):
    """
    Handles user login.
    """
    email = request.data.get("email")
    password = request.data.get('password')

    if not email or not password:
        return JsonResponse({"success": False,"message": "Email and password are required."}, status=400)
    
    try:
        user = User.objects.get(email=email)
        if not user.check_password(password):
            return JsonResponse({"success": False,"message": "Invalid password."}, status=400)
        
        response=JsonResponse({"success": True,"email":email}, status=200)
        csrf_token = get_token(request)
        response.set_cookie("csrftoken",csrf_token)

        return response

    except User.DoesNotExist:
        return JsonResponse({"success": False,"message": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False,"message": str(e)}, status=500)
    

@api_view(['POST'])
@permission_classes([])
@csrf_protect
def verify_2fa(request):
    """
    Handles 2FA verification.
    """
    email = request.data.get("email")
    token = request.data.get("token")

    if not token:
        return JsonResponse({"success": False,"message": "Token is required"}, status=400)
    
    try:
        user = User.objects.get(email=email)
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(token):
            return JsonResponse({"success": False,"message": "Invalid token"}, status=400)
        
        response= JsonResponse({"success": True,
                            "message": "2FA verification successful.",
                            "role": user.role}, status=200)
        
        RT=RefreshToken.for_user(user)
        AT=RT.access_token
        RT=RefreshToken.for_user(user)
        AT['role'] = user.role
        RT['role'] = user.role
        AT['email'] = user.email
        RT['email'] = user.email
        print(AT)
        print(RT)
        response.set_cookie(
             "access_token",
              AT,
              max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
              httponly=True,secure=False,samesite='Lax')
        
        response.set_cookie("refresh_token",
                            RT,
                            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                            httponly=True,secure=False,samesite='Lax')

        return response

    except User.DoesNotExist:
        return JsonResponse({"success": False,"message":"User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False,"message": str(e)}, status=500)
    
@api_view(['POST'])
def logout(request):
    response= JsonResponse({"message": "User logged out successfully."}, status=200)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("csrftoken")
    return response


@api_view(['POST'])
@permission_classes([])
def verify_token_or_verify_refresh(request):
    access_token = request.COOKIES.get('access_token')
    refresh_token = request.COOKIES.get('refresh_token')

    if not access_token or not refresh_token:
        return JsonResponse({"success":False, "message":"Authentication credentials missing."}, status=401)
    
    # Verify the access token
    try:
        AccessToken(access_token)
        decoded_token = AccessToken(access_token).payload
        return JsonResponse({"success":True, "message": "Access token is valid.","role":decoded_token["role"],'email':decoded_token["email"]}, status=200)
    except (TokenError, InvalidToken):
        # Access token is expired or invalid, so proceed with refresh token logic
        pass
    
    # If access token is invalid, try to refresh using the refresh token
    try:
        # Verify the refresh token
        refresh = RefreshToken(refresh_token)
        
        # Generate a new access token using the refresh token
        new_access_token = str(refresh.access_token)
        decoded_token = AccessToken(new_access_token).payload

        # Return the new access token as a response and set it in cookies
        response = JsonResponse({"success":True,"message":"Token generated with refresh token","role":decoded_token['role'],'email':decoded_token["email"]}, status=200)
        response.set_cookie(
            "access_token", 
            new_access_token, 
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            httponly=True,
            secure=True,
            samesite='Lax'
        )
        return response
    except InvalidToken:
        return JsonResponse(
            {"success":False, "message": "Refresh token is invalid or expired. Please log in again."}, 
            status=401
        )
    except Exception as e:
        return JsonResponse({"success":False, "message" :str(e)}, status=500)
    
@api_view(['POST'])
def change_password(request):
    """
    Handles password change.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "message": "Authentication required."}, status=401)

    email = request.user
    print(email)
    old_password = request.data.get("currentPassword")
    new_password = request.data.get("newPassword")

    if not old_password or not new_password:
        return JsonResponse({"success": False, "message": "Old password and new password are required."}, status=400)
    
    try:
        user = User.objects.get(email=email)
        print(user)

        if not user.check_password(old_password):
            return JsonResponse({"success": False, "message": "Invalid old password."}, status=400)
        
        user.set_password(new_password)
        user.save()
        
        return JsonResponse({"success": True, "message": "Password changed successfully."}, status=200)
    
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)


@api_view(['GET'])
def get_all_users(request):
    try:
        if not request.user.is_staff:
            return JsonResponse({"success": False, "message": " Admin Authentication required."}, status=401)

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return JsonResponse({
            "success": True,
            "users":serializer.data, 
            },status=200)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@api_view(['DELETE'])
def delete_user(request,email):
    try:
        if not request.user.is_staff:
            return JsonResponse({"success": False, "message": "Admin Authentication required."}, status=401)
        if request.user==email:
            return JsonResponse({"success": False, "message": "Cannot delete yourself."}, status=400)
        
        user = User.objects.get(email=email)
        user.delete()
        return JsonResponse({"success": True, "message": "User deleted successfully."}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)