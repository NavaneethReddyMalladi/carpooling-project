from flask import Blueprint, request
from app.main.services.user import (
    get_user_by_id,
    get_all_users,
    update_user,
    delete_user
)


user_bp = Blueprint('user_bp', __name__)

# -----------------------
# POST /users - Add user
# # -----------------------
# @user_bp.route('/users', methods=['POST'])
# def create_user():
#     data = request.get_json()
#     return add_user(data)

# -----------------------------
# GET /users/<int:user_id> - Get user by ID
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return get_user_by_id(user_id)

# -----------------------
# GET /users - Get all users
# -----------------------
@user_bp.route('/users', methods=['GET'])
def get_users():
    return get_all_users()

# -----------------------------
# PUT /users/<int:user_id> - Update user
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user_by_id(user_id):
    data = request.get_json()
    return update_user(user_id, data)

# -----------------------------
# DELETE /users/<int:user_id> - Delete user
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_by_id(user_id):
    return delete_user(user_id)
