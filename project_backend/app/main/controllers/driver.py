from flask import Blueprint, request
from app.main.services.drivers import (
    add_driver,
    get_driver_by_id,
    get_all_drivers,
    update_driver,
    delete_driver
)

driver_bp = Blueprint('driver_bp', __name__)


# Add driver
@driver_bp.route('/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    return add_driver(data)





@driver_bp.route('/drivers/<int:driver_id>', methods=['GET']) #to get a driver by id
def get_driver(driver_id):
    return get_driver_by_id(driver_id)




@driver_bp.route('/drivers', methods=['GET']) # to  get all drivers
def get_drivers():
    return get_all_drivers()





@driver_bp.route('/drivers/<int:driver_id>', methods=['PUT']) # to update a driver
def update_driver_by_id(driver_id):
    data = request.get_json()
    return update_driver(driver_id, data)





@driver_bp.route('/drivers/<int:driver_id>', methods=['DELETE']) #to delete a driver
def delete_driver_by_id(driver_id):
    return delete_driver(driver_id)
