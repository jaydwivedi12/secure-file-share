# Secure File Share

## How to Start the Project:
 ```bash
git clone https://github.com/jaydwivedi12/secure-file-share
cd secure-file-share

#Start the application
docker-compose up --build

#Note: Make Sure to allow your browser to open self-signed Websites
```

## How to Login

### **Test Normal User Credentials**

- **Email**: `email@test.com`
- **Password**: `Abcd@1234`

    <img src="./assets/forReadme/regular_user_2FA.png" alt="admin_jay_2FA.png" alt="QR Code" width="150" />

1. Download and install the **Google Authenticator** app.
2. Use the **URI** above to configure the app. Scan the URI 
3. After logging in with the username and password, the app will generate a 6-digit OTP that you will enter to complete the login.

### **Test Admin Credentials**

To test the admin login system, you can use the following test credentials:


- **Email**: `jay@gmail.com`
- **Password**: `Mlpnko@098`
- **Google Authenticator URI**: `otpauth://totp/Secure%20File%20Sharing%20App:jay%40gmail.com?secret=WTW3C4ICEO65JGSKV4J6WF6XJLBO2QH2&issuer=Secure%20File%20Sharing%20App`

    <img src="./assets/forReadme/admin_jay_2FA.png" alt="admin_jay_2FA.png" alt="QR Code" width="150" />

1. Download and install the **Google Authenticator** app.
2. Use the **URI** above to configure the app. Scan the URI or manually input the details into the Google Authenticator app.
3. After logging in with the username and password, the app will generate a 6-digit OTP that you will enter to complete the login.

### Creating New Admin Credentials

To create new admin credentials:

 <p style="color: red; font-weight: bold;">For security purposes, I have used the backend terminal only to generate admin credentials. Although, we can implement admin registration from the client-side as well.</p>

1. **Access the backend Terminal**:

   ```bash
   cd Backend
   ```

2. **Create Admin User**:

    ```bash
    python manage.py createsuperuser
    ```

    - Enter the email.
    - Enter the password.

When creating a new admin user, the backend will automatically generate a unique URI for Google Authenticator for that user.

3. **Obtain the URI**: After the admin user is created, you will receive a URI (secret) that you can use with Google Authenticator.

   Example URI format:

   ```bash
   otpauth://totp/<email>?secret=<secret_key>&issuer=<app_name>
   ```

4. **Configure Google Authenticator**: Open the **Google Authenticator** app on your phone.

   - Choose "Scan a QR code" to scan the generated URI (or enter it manually).
   - The app will start generating 6-digit OTPs for the new admin user.

5. **Login with New Credentials**:
   - Use the new admin email and password to log in.
   - After successful login, the app will prompt for the 6-digit OTP generated by Google Authenticator.
   - Enter the OTP to successfully complete the login.
