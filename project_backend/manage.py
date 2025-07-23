from flask import Flask, jsonify, request

from app import db,app

from app.main.models import drivers,messages,payments,reviews,riderDetails,riders,rideRequests,routeStops,roles,stops,user,wallet,rides,riders
from app.main.services.user import  User
from app.main.services.drivers import Drivers


        

def run():

    with app.app_context():
        # db.drop_all()
        db.create_all()

    app.run(debug=True,port=42099)

if __name__ == "__main__":
   
    run()