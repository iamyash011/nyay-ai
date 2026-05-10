"""Development settings — SQLite, DEBUG=True."""
from .base import *  # noqa

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True

# Show SQL queries in dev
# LOGGING["loggers"]["django.db.backends"] = {
#     "handlers": ["console"], "level": "DEBUG", "propagate": False
# }
