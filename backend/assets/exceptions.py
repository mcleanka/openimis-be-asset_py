from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.db import IntegrityError
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON responses for all errors.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # If it's already a DRF response, ensure it has our standard format
        if isinstance(exc, DRFValidationError):
            # Handle DRF validation errors
            response.data = {
                'success': False,
                'error': {
                    'code': 'validation_error',
                    'message': 'One or more validation errors occurred',
                    'details': response.data
                }
            }
        else:
            # Handle other DRF exceptions
            response.data = {
                'success': False,
                'error': {
                    'code': getattr(exc, 'code', 'error'),
                    'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
                    'details': response.data
                }
            }
    else:
        # Handle non-DRF exceptions
        if isinstance(exc, DjangoValidationError):
            # Handle Django model validation errors
            response = Response(
                {
                    'success': False,
                    'error': {
                        'code': 'validation_error',
                        'message': 'Validation failed',
                        'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        elif isinstance(exc, IntegrityError):
            # Handle database integrity errors
            response = Response(
                {
                    'success': False,
                    'error': {
                        'code': 'integrity_error',
                        'message': 'Database integrity error occurred',
                        'details': str(exc)
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Handle any other unexpected exceptions
            logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
            response = Response(
                {
                    'success': False,
                    'error': {
                        'code': 'server_error',
                        'message': 'An unexpected error occurred',
                        'details': str(exc) if settings.DEBUG else None
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return response
