"""Adrita Bima Kendra employee portal server with email OTP password reset.

Configure SMTP_* environment variables before production use. Start with:
    python auth_server.py
Then open http://localhost:8000/login.html
"""
import hashlib
import hmac
import json
import os
import secrets
import smtplib
import sqlite3
import time
from email.message import EmailMessage
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "adrita_portal.db"
OTP_TTL_SECONDS = 600


def load_local_environment():
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip('"\'')


load_local_environment()
OTP_PEPPER = os.environ.get("OTP_PEPPER", "change-this-otp-pepper-before-production")
AUTH_SECRET = os.environ.get("AUTH_SECRET", "change-this-auth-secret-before-production")


def db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    with db_connection() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS password_otps (
                email TEXT PRIMARY KEY COLLATE NOCASE,
                otp_hash TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                requested_at INTEGER NOT NULL
            );
        """)


def password_hash(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 310_000)
    return f"{salt.hex()}${digest.hex()}"


def password_matches(password, stored):
    try:
        salt_hex, digest_hex = stored.split("$", 1)
        candidate = password_hash(password, bytes.fromhex(salt_hex)).split("$", 1)[1]
        return hmac.compare_digest(candidate, digest_hex)
    except (ValueError, AttributeError):
        return False


def otp_hash(email, otp):
    return hmac.new(OTP_PEPPER.encode(), f"{email.lower()}:{otp}".encode(), hashlib.sha256).hexdigest()


def smtp_configured():
    host = os.environ.get("SMTP_HOST")
    username = os.environ.get("SMTP_USERNAME")
    password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM", username or "")
    return bool(host and username and password and sender)


def send_otp_email(email, otp):
    host = os.environ.get("SMTP_HOST")
    username = os.environ.get("SMTP_USERNAME")
    password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM", username or "")
    if not all([host, username, password, sender]):
        if os.environ.get("ALLOW_DEMO_OTP", "false").lower() == "true":
            print(f"DEMO OTP for {email}: {otp}")
            return
        raise RuntimeError("Email service is not configured. Set SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD and SMTP_FROM.")
    message = EmailMessage()
    message["Subject"] = "Your Adrita Bima Kendra password reset OTP"
    message["From"] = sender
    message["To"] = email
    message.set_content(f"Your password reset OTP is: {otp}\n\nIt expires in 10 minutes. Never share this OTP with anyone.")
    try:
        port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError as error:
        raise RuntimeError("SMTP_PORT must be a valid port number.") from error
    if os.environ.get("SMTP_USE_SSL", "false").lower() == "true":
        with smtplib.SMTP_SSL(host, port, timeout=20) as client:
            client.login(username, password)
            client.send_message(message)
    else:
        with smtplib.SMTP(host, port, timeout=20) as client:
            client.starttls()
            client.login(username, password)
            client.send_message(message)


class PortalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, status, body, session_email=None, clear_session=False):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        if session_email:
            token = hmac.new(AUTH_SECRET.encode(), session_email.encode(), hashlib.sha256).hexdigest()
            self.send_header("Set-Cookie", f"adrita_session={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800")
        elif clear_session:
            self.send_header("Set-Cookie", "adrita_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0")
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid request body.") from error
        if length > 20_000:
            raise ValueError("Request is too large.")
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("Request body must be a JSON object.")
        return payload

    def current_employee(self):
        cookies = self.headers.get("Cookie", "")
        token = next((part.strip().split("=", 1)[1] for part in cookies.split(";") if part.strip().startswith("adrita_session=") and "=" in part), "")
        if not token:
            return None
        with db_connection() as db:
            employees = db.execute("SELECT id, name, email FROM users").fetchall()
        for employee in employees:
            expected = hmac.new(AUTH_SECRET.encode(), employee["email"].encode(), hashlib.sha256).hexdigest()
            if hmac.compare_digest(token, expected):
                return employee
        return None

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/employee-dashboard.html" and not self.current_employee():
            self.send_response(HTTPStatus.FOUND)
            self.send_header("Location", "/login.html")
            self.end_headers()
            return
        if path == "/api/session":
            employee = self.current_employee()
            if not employee:
                self.json_response(HTTPStatus.UNAUTHORIZED, {"message": "Please sign in to continue."})
            else:
                self.json_response(HTTPStatus.OK, {"name": employee["name"], "email": employee["email"]})
            return
        super().do_GET()

    def do_POST(self):
        try:
            payload = self.read_json()
            if self.path == "/api/register":
                self.json_response(HTTPStatus.FORBIDDEN, {"message": "Employee accounts are created by the portal administrator."})
            elif self.path == "/api/login":
                self.login(payload)
            elif self.path == "/api/logout":
                self.json_response(HTTPStatus.OK, {"message": "Signed out successfully."}, clear_session=True)
            elif self.path == "/api/forgot-password":
                self.forgot_password(payload)
            elif self.path == "/api/reset-password":
                self.reset_password(payload)
            else:
                self.json_response(HTTPStatus.NOT_FOUND, {"message": "Endpoint not found."})
        except (ValueError, json.JSONDecodeError) as error:
            self.json_response(HTTPStatus.BAD_REQUEST, {"message": str(error) or "Invalid request."})
        except Exception as error:
            self.log_error("Portal error: %s", error)
            self.json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"message": "The secure service is temporarily unavailable. Please try again."})

    @staticmethod
    def valid_email(email):
        return isinstance(email, str) and "@" in email and "." in email.rsplit("@", 1)[-1]

    def login(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        if not self.valid_email(email) or not password:
            self.json_response(HTTPStatus.BAD_REQUEST, {"message": "Enter a valid work email address and password."})
            return
        with db_connection() as db:
            user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not password_matches(password, user["password_hash"]):
            self.json_response(HTTPStatus.UNAUTHORIZED, {"message": "Invalid work email or password."})
            return
        self.json_response(HTTPStatus.OK, {"message": f"Welcome, {user['name']}. Login successful."}, session_email=email)

    def forgot_password(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        if not self.valid_email(email):
            raise ValueError("Enter a valid email address.")
        demo_otp = None
        with db_connection() as db:
            user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if user:
            otp = f"{secrets.randbelow(1_000_000):06d}"
            now = int(time.time())
            try:
                send_otp_email(email, otp)
            except (RuntimeError, OSError, smtplib.SMTPException) as error:
                self.log_error("OTP delivery failed: %s", error)
                if os.environ.get("ALLOW_DEMO_OTP", "false").lower() == "true":
                    demo_otp = otp
                    self.log_message("DEMO OTP for %s is %s", email, otp)
                else:
                    self.json_response(HTTPStatus.SERVICE_UNAVAILABLE, {"message": "Password reset email is not configured. Set the SMTP settings and try again."})
                    return
            with db_connection() as db:
                db.execute("INSERT INTO password_otps(email, otp_hash, expires_at, attempts, requested_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(email) DO UPDATE SET otp_hash=excluded.otp_hash, expires_at=excluded.expires_at, attempts=0, requested_at=excluded.requested_at", (email, otp_hash(email, otp), now + OTP_TTL_SECONDS, now))
        message = "If this email is registered, a 6-digit OTP has been sent. It expires in 10 minutes."
        response = {"message": message}
        if demo_otp:
            response["demo_otp"] = demo_otp
        self.json_response(HTTPStatus.OK, response)

    def reset_password(self, payload):
        email = str(payload.get("email", "")).strip().lower()
        otp = str(payload.get("otp", "")).strip()
        password = str(payload.get("password", ""))
        if not self.valid_email(email) or not (otp.isdigit() and len(otp) == 6) or len(password) < 8:
            raise ValueError("Enter a valid email, 6-digit OTP and a password of at least 8 characters.")
        with db_connection() as db:
            record = db.execute("SELECT * FROM password_otps WHERE email = ?", (email,)).fetchone()
            if not record or record["expires_at"] < int(time.time()) or record["attempts"] >= 5 or not hmac.compare_digest(record["otp_hash"], otp_hash(email, otp)):
                if record:
                    db.execute("UPDATE password_otps SET attempts = attempts + 1 WHERE email = ?", (email,))
                self.json_response(HTTPStatus.BAD_REQUEST, {"message": "The OTP is invalid, expired or has too many attempts. Request a new OTP."})
                return
            db.execute("UPDATE users SET password_hash = ? WHERE email = ?", (password_hash(password), email))
            db.execute("DELETE FROM password_otps WHERE email = ?", (email,))
        self.json_response(HTTPStatus.OK, {"message": "Password reset successful. Please log in with your new password."})


if __name__ == "__main__":
    init_database()
    print("Adrita employee portal server started: http://localhost:8000/login.html")
    print("Configure SMTP_* environment variables before sending real OTP emails.")
    ThreadingHTTPServer(("0.0.0.0", 8000), PortalHandler).serve_forever()
