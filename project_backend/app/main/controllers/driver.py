from flask import Blueprint, request
from app.main.services.drivers import (
    add_driver,
    get_driver_by_id,
    get_all_drivers,
    update_driver,
    delete_driver
)

driver_bp = Blueprint('driver_bp', __name__)

# ------------------------
# POST /drivers - Add driver
# ------------------------
@driver_bp.route('/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    return add_driver(data)

# -----------------------------
# GET /drivers/<int:driver_id> - Get driver by ID
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    return get_driver_by_id(driver_id)

# ------------------------
# GET /drivers - Get all drivers
# ------------------------
@driver_bp.route('/drivers', methods=['GET'])
def get_drivers():
    return get_all_drivers()

# -----------------------------
# PUT /drivers/<int:driver_id> - Update driver
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
def update_driver_by_id(driver_id):
    data = request.get_json()
    return update_driver(driver_id, data)

# -----------------------------
# DELETE /drivers/<int:driver_id> - Delete driver
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver_by_id(driver_id):
    return delete_driver(driver_id)
