from flask import Blueprint, request
from app.main.services.reviews import (
    add_review,
    get_review_by_id,
    get_all_reviews,
    update_review,
    delete_review
)

review_bp = Blueprint('review_bp', __name__)



@review_bp.route('/reviews', methods=['POST'])
def create_review():
    data = request.get_json()
    return add_review(data)



@review_bp.route('/reviews/<int:review_id>', methods=['GET'])
def fetch_review(review_id):
    return get_review_by_id(review_id)




@review_bp.route('/reviews', methods=['GET'])
def fetch_all_reviews():
    return get_all_reviews()




@review_bp.route('/reviews/<int:review_id>', methods=['PUT'])
def modify_review(review_id):
    data = request.get_json()
    return update_review(review_id, data)




@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
def remove_review(review_id):
    return delete_review(review_id)
