"""
Custom exception handler for consistent API error responses.

Error Code Standards:
- 400 Bad Request: Validation errors
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not enough permissions
- 404 Not Found: Resource not found
- 409 Conflict: Duplicate code/unique constraint violation
"""

from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    ValidationError,
    NotAuthenticated,
    AuthenticationFailed,
    PermissionDenied,
    NotFound,
)
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error responses.
    
    Response format:
    {
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {...}  # Optional, for validation errors
        }
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is None:
        return response
    
    # Build consistent error response
    error_response = {
        'error': {
            'code': 'UNKNOWN_ERROR',
            'message': str(exc),
        }
    }
    
    # Handle different exception types
    if isinstance(exc, ValidationError):
        error_response['error']['code'] = 'VALIDATION_ERROR'
        error_response['error']['message'] = 'Dữ liệu không hợp lệ'
        error_response['error']['details'] = response.data
        
        # Check for unique constraint violations (code field)
        if hasattr(response.data, 'get'):
            code_errors = response.data.get('code', [])
            if any('đã tồn tại' in str(err) for err in code_errors):
                response.status_code = status.HTTP_409_CONFLICT
                error_response['error']['code'] = 'DUPLICATE_CODE'
                error_response['error']['message'] = code_errors[0] if code_errors else 'Mã đã tồn tại'
        
    elif isinstance(exc, NotAuthenticated):
        error_response['error']['code'] = 'NOT_AUTHENTICATED'
        error_response['error']['message'] = 'Bạn cần đăng nhập để thực hiện thao tác này'
        
    elif isinstance(exc, AuthenticationFailed):
        error_response['error']['code'] = 'AUTHENTICATION_FAILED'
        error_response['error']['message'] = 'Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn'
        
    elif isinstance(exc, PermissionDenied) or isinstance(exc, DjangoPermissionDenied):
        error_response['error']['code'] = 'PERMISSION_DENIED'
        error_response['error']['message'] = 'Bạn không có quyền thực hiện thao tác này. Chỉ Admin mới có quyền.'
        
    elif isinstance(exc, NotFound) or isinstance(exc, Http404):
        error_response['error']['code'] = 'NOT_FOUND'
        error_response['error']['message'] = 'Không tìm thấy tài nguyên yêu cầu'
    
    # Keep original detail if exists and not overwritten
    if hasattr(exc, 'detail') and 'details' not in error_response['error']:
        if isinstance(exc.detail, dict):
            error_response['error']['details'] = exc.detail
        elif isinstance(exc.detail, str):
            error_response['error']['message'] = exc.detail
    
    response.data = error_response
    return response
