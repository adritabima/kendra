# Secure Login and OTP Setup

The employee login and password-reset system is served by `auth_server.py`. It stores authorised employee accounts in `adrita_portal.db` and sends password-reset OTPs through your SMTP email account. Public account registration is disabled.

Before starting the server, create a file named `.env` in the website folder. The server loads it automatically:

```powershell
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=adritabimakendra@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=adritabimakendra@gmail.com
SMTP_USE_SSL=false
AUTH_SECRET=replace-with-a-long-random-secret
OTP_PEPPER=replace-with-a-second-long-random-secret
```

For Gmail, enable 2-Step Verification and create a 16-character App Password under Google Account security. Use that App Password as `SMTP_PASSWORD`; never use the normal Gmail password. The `.env` file is ignored by Git.

Then run `start_auth_server.bat` and open `http://localhost:8000/login.html`.

## Create an employee account

The administrator must create each employee account before the employee can log in. From PowerShell in the website folder, run:

```powershell
python create_employee.py
```

Enter the employee's name, authorised work email and a temporary password. Employees can use **Forgot password?** to set a new password through their work-email OTP.

Do not open `login.html` directly or through a separate Live Server: the OTP endpoints require the Python server. In production, set the same variables in your hosting environment and serve the site over HTTPS.
