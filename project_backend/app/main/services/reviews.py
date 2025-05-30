from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app import db
from app.main.models.reviews import Review
from app.main.models.rides import Rides
from app.main.models.user import User
from datetime import datetime

def add_review(data):
    try:
        Rides_id = data.get('Rides_id')
        User_id = data.get('User_id')
        rating = data.get('rating')
        comment = data.get('comment')

        # Validate required fields
        if not all([Rides_id, User_id, rating is not None]):
            return jsonify({"message": "Rides_id, User_id, and rating are required"}), 400

        if not isinstance(rating, int) or not (1 <= rating <= 5):
            return jsonify({"message": "Rating must be an integer between 1 and 5"}), 400

        # Validate foreign keys
        if not Rides.query.get(Rides_id):
            return jsonify({"message": "Rides not found"}), 404
        if not User.query.get(User_id):
            return jsonify({"message": "User not found"}), 404

        review = Review(
            Rides_id=Rides_id,
            User_id=User_id,
            rating=rating,
            comment=comment,
            create_datetime=datetime.utcnow()
        )

        db.session.add(review)
        db.session.commit()
        return jsonify({"message": "Review added successfully", "review_id": review.review_id}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_review_by_id(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        review_data = {
            "review_id": review.review_id,
            "Rides_id": review.Rides_id,
            "User_id": review.User_id,
            "rating": review.rating,
            "comment": review.comment,
            "create_datetime": review.create_datetime
        }
        return jsonify(review_data), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_all_reviews():
    try:
        reviews = Review.query.all()
        output = []
        for review in reviews:
            output.append({
                "review_id": review.review_id,
                "Rides_id": review.Rides_id,
                "User_id": review.User_id,
                "rating": review.rating,
                "comment": review.comment,
                "create_datetime": review.create_datetime
            })
        return jsonify(output), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def update_review(review_id, data):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        if 'Rides_id' in data:
            if not Rides.query.get(data['Rides_id']):
                return jsonify({"message": "Rides not found"}), 404
            review.Rides_id = data['Rides_id']

        if 'User_id' in data:
            if not User.query.get(data['User_id']):
                return jsonify({"message": "User not found"}), 404
            review.User_id = data['User_id']

        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or not (1 <= rating <= 5):
                return jsonify({"message": "Rating must be an integer between 1 and 5"}), 400
            review.rating = rating

        if 'comment' in data:
            review.comment = data['comment']

        db.session.commit()
        return jsonify({"message": "Review updated successfully"}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def delete_review(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500
