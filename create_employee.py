"""Create an authorised employee account for the Adrita Bima Kendra portal."""
import getpass
import sqlite3
import time

from auth_server import db_connection, init_database, password_hash


def valid_email(email):
    return "@" in email and "." in email.rsplit("@", 1)[-1]


def main():
    init_database()
    print("Create authorised employee account")
    name = input("Employee name: ").strip()
    email = input("Work email: ").strip().lower()
    password = getpass.getpass("Temporary password (minimum 8 characters): ")
    confirm_password = getpass.getpass("Confirm temporary password: ")
    if not name or not valid_email(email) or len(password) < 8 or password != confirm_password:
        raise SystemExit("Enter a name, valid work email and matching password of at least 8 characters.")
    try:
        with db_connection() as db:
            db.execute("INSERT INTO users(name, email, password_hash, created_at) VALUES (?, ?, ?, ?)", (name, email, password_hash(password), int(time.time())))
    except sqlite3.IntegrityError:
        raise SystemExit("An employee account already exists for this work email.")
    print(f"Employee account created for {email}.")


if __name__ == "__main__":
    main()
