import re

from django.core.exceptions import ValidationError


class PasswordComplexityValidator:
    """Requires upper, lower, digit, and symbol on top of Django's built-in
    length/common-password/similarity validators."""

    def validate(self, password, user=None):
        checks = {
            r"[A-Z]": "an uppercase letter",
            r"[a-z]": "a lowercase letter",
            r"\d": "a digit",
            r"[^\w\s]": "a symbol",
        }
        missing = [desc for pattern, desc in checks.items() if not re.search(pattern, password)]
        if missing:
            raise ValidationError(f"Password must contain at least {', '.join(missing)}.")

    def get_help_text(self):
        return "Password must include an uppercase letter, a lowercase letter, a digit, and a symbol."
