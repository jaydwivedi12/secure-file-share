from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie,csrf_protect
from django.middleware.csrf import get_token
from django.conf import settings
from rest_framework.decorators import api_view,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from .models import User
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
        
        response.set_cookie(
             "access_token",
              RefreshToken.for_user(user),
              max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
              httponly=True,secure=True,samesite='Lax')
        
        response.set_cookie("refresh_token",
                            AccessToken.for_user(user),
                            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                            httponly=True,secure=True,samesite='Lax')

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