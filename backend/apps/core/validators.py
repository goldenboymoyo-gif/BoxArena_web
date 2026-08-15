"""
Shared file-upload validation (PUGNERA spec §25 / §5-6).

Threat: a user uploads a disguised executable/script as a "profile photo",
or an oversized/decompression-bomb image, or a filename crafted for path
traversal. Filenames and client-supplied Content-Type are never trusted.
"""
import io
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError

try:
    from PIL import Image
except ImportError:  # Pillow not installed in some tooling contexts
    Image = None

_ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}


def validate_image_upload(file_obj) -> str:
    """Validate an uploaded image by actually decoding it (not by trusting
    the filename or the browser-supplied MIME type). Returns a safe file
    extension to use for the generated storage key.
    """
    max_bytes = getattr(settings, "PROFILE_IMAGE_MAX_BYTES", 5 * 1024 * 1024)
    if file_obj.size > max_bytes:
        raise ValidationError(f"Image exceeds the {max_bytes // (1024 * 1024)}MB limit.")

    if Image is None:
        raise ValidationError("Image processing is unavailable.")

    raw = file_obj.read()
    file_obj.seek(0)
    try:
        img = Image.open(io.BytesIO(raw))
        img.verify()  # detects truncated/malformed files & non-image payloads
        # Re-open after verify() (which leaves the file unusable for further ops)
        img = Image.open(io.BytesIO(raw))
        fmt = img.format
    except Exception as exc:  # noqa: BLE001 - any decode failure is a rejection
        raise ValidationError("File is not a valid image.") from exc

    if fmt not in _ALLOWED_FORMATS:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed.")

    max_dim = getattr(settings, "PROFILE_IMAGE_MAX_DIMENSION", 4096)
    if img.width > max_dim or img.height > max_dim:
        raise ValidationError(f"Image dimensions must not exceed {max_dim}px.")

    return _ALLOWED_FORMATS[fmt]


def safe_storage_key(prefix: str, extension: str) -> str:
    """Never trust a user-supplied filename for the storage key (path
    traversal, collisions, information disclosure). Always generate one
    server-side."""
    return f"{prefix}/{uuid.uuid4().hex}.{extension}"
