from flask_restx import Namespace

class UserDTO:
    api = Namespace("user", description="User operations")
