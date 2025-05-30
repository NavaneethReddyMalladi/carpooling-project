from flask import Blueprint, request, jsonify
from app.main.services.roles import (
    create_role,
    get_all_roles,
    get_role_by_id,
    update_role,
    delete_role
)

roles_bp = Blueprint('roles_bp', __name__)

# Create a new role
@roles_bp.route('/roles', methods=['POST'])
def create():
    data = request.get_json()
    role_name = data.get('role_name')
    if not role_name:
        return jsonify({"error": "role_name is required"}), 400
    role = create_role(role_name)
    return jsonify({
        "message": "Role created",
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 201

# Get all roles
@roles_bp.route('/roles', methods=['GET'])
def get_all():
    roles = get_all_roles()
    result = [{
        "role_id": role.role_id,
        "role_name": role.role_name
    } for role in roles]
    return jsonify(result), 200

# Get a role by ID
@roles_bp.route('/roles/<int:role_id>', methods=['GET'])
def get_by_id(role_id):
    role = get_role_by_id(role_id)
    if not role:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 200

# Update a role
@roles_bp.route('/roles/<int:role_id>', methods=['PUT'])
def update(role_id):
    data = request.get_json()
    new_role_name = data.get('role_name')
    if not new_role_name:
        return jsonify({"error": "role_name is required"}), 400
    role = update_role(role_id, new_role_name)
    if not role:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({
        "message": "Role updated",
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 200

# Delete a role
@roles_bp.route('/roles/<int:role_id>', methods=['DELETE'])
def delete(role_id):
    success = delete_role(role_id)
    if not success:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({"message": "Role deleted"}), 200
