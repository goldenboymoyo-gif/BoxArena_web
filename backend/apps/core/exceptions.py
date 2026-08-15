import logging
import uuid

from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("django")


def safe_exception_handler(exc, context):
    """Never leak stack traces, DB errors, file paths, or secrets to API
    clients (PUGNERA spec §29). Full detail is logged server-side with a
    correlation id the client can quote in a support request.
    """
    response = exception_handler(exc, context)
    error_id = str(uuid.uuid4())

    if response is not None:
        # Known, already-safe DRF/validation errors — keep their detail but
        # attach a correlation id for support/log lookup.
        if isinstance(response.data, dict):
            response.data["error_id"] = error_id
        logger.warning("handled_exception", extra={"error_id": error_id, "status": response.status_code})
        return response

    # Unhandled exception: log full detail internally, return a generic
    # message externally.
    logger.exception("unhandled_exception", extra={"error_id": error_id})
    return Response(
        {"detail": "An unexpected error occurred. Please try again.", "error_id": error_id},
        status=500,
    )
