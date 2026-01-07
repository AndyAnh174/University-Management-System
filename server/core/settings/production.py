from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# Security settings
SECURE_SSL_REDIRECT = False # Set True if using HTTPS
SESSION_COOKIE_SECURE = False # Set True if using HTTPS
CSRF_COOKIE_SECURE = False # Set True if using HTTPS

print("🚀 Django is running in PRODUCTION mode.")
