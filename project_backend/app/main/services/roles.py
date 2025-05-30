from app import db
from app.main.models.roles import Role
# Create a new role
def create_role(role_name):
    role = Role(role_name=role_name)
    db.session.add(role)
    db.session.commit()
    return role

# Get all roles
def get_all_roles():
    return Role.query.all()

# Get a single role by ID
def get_role_by_id(role_id):
    return Role.query.get(role_id)

# Update an existing role
def update_role(role_id, new_role_name):
    role = Role.query.get(role_id)
    if not role:
        return None
    role.role_name = new_role_name
    db.session.commit()
    return role

# Delete a role
def delete_role(role_id):
    role = Role.query.get(role_id)
    if not role:
        return False
    db.session.delete(role)
    db.session.commit()
    return True
