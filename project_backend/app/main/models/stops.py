from datetime import datetime
from app import db
import enum

# Step 1: Define the Enum
class StopTypeEnum(enum.Enum):
    ORIGIN = 'Origin'
    DESTINATION = 'Destination'
    INTERMEDIATE = 'Intermediate'

# Step 2: Update the model
class Stops(db.Model):
    __tablename__ = 'stops'

    stop_id = db.Column(db.Integer, primary_key=True)
    stop_name = db.Column(db.String(100), nullable=False)
    
    stop_type = db.Column(db.Enum(StopTypeEnum), nullable=False, default=StopTypeEnum.INTERMEDIATE)
# origin, intermediate, destination
    route_id = db.Column(db.Integer, nullable=False)
    stop_order = db.Column(db.Integer, nullable=False)
    create_datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
