from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

from flask_cors import CORS


from app.main.config.dev_config import DevConfig  # <-- import the config class

load_dotenv()

app = Flask(__name__)

CORS(app)

app.config.from_object(DevConfig)  # <-- apply the config

db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

from app.main.controllers.user import user_bp
app.register_blueprint(user_bp)

from app.main.controllers.driver import driver_bp
app.register_blueprint(driver_bp)

# from app.main.controllers.riders import rider_bp
# app.register_blueprint(rider_bp)

from app.main.controllers.rides import rides_bp
app.register_blueprint(rides_bp)

from app.main.controllers.messages import message_bp
app.register_blueprint(message_bp)

from app.main.controllers.payments import payment_bp
app.register_blueprint(payment_bp)

from app.main.controllers.reviews import review_bp
app.register_blueprint(review_bp)

from app.main.controllers.rideRequest import ride_requests_bp
app.register_blueprint(ride_requests_bp)

from app.main.controllers.riderDetails import rider_details_bp
app.register_blueprint(rider_details_bp)

from app.main.controllers.routeStops import route_stops_bp
app.register_blueprint(route_stops_bp)


from app.main.controllers.stops import stops_bp
app.register_blueprint(stops_bp)

from app.main.controllers.wallet import wallets_bp
app.register_blueprint(wallets_bp)

from app.main.controllers.roles import roles_bp
app.register_blueprint(roles_bp)


from app.main.utils.auth import auth_bp
app.register_blueprint(auth_bp)

# from app.main.utils.auth import auth_bp
# app.register_blueprint(auth_bp, url_prefix='/auth')