from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import abort
 
def requires_role(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != required_role:
                abort(403, description=f"{required_role} role required.")
            return fn(*args, **kwargs)
        return decorator
    return wrapper
 
def requires_roles(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') not in allowed_roles:
                abort(403, description="Access denied: insufficient role.")
            return fn(*args, **kwargs)
        return decorator
    return wrapper
 