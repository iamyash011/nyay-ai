"""Production settings — PostgreSQL, DEBUG=False, secure cookies."""
from .base import *  # noqa
import dj_database_url

DEBUG = False

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL", conn_max_age=600, ssl_require=True
    )
}

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
