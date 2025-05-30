from app import db

class RouteStop(db.Model):
    __tablename__ = 'routes'

    route_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    start_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    end_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    distance = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Integer, nullable=False)

    start_stop = db.relationship('Stops', foreign_keys=[start_stop_id], backref=db.backref('routes_starting_here', lazy=True))
    end_stop = db.relationship('Stops', foreign_keys=[end_stop_id], backref=db.backref('routes_ending_here', lazy=True))
