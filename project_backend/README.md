users [
  {
    "created_at": "Fri, 30 May 2025 12:57:53 GMT",
    "email": "dnavaneeth@gmail.com",
    "gender": "male",
    "is_verified": false,
    "phone_number": "9908245918",
    "role_id": 1,
    "user_id": 11,
    "user_name": "dnavaneeth"
  },
  {
    "created_at": "Fri, 30 May 2025 12:59:09 GMT",
    "email": "rnavaneeth@gmail.com",
    "gender": "male",
    "is_verified": false,
    "phone_number": "9908213185",
    "role_id": 2,
    "user_id": 12,
    "user_name": "rnavaneeth"
  },
  {
    "created_at": "Fri, 30 May 2025 13:00:18 GMT",
    "email": "dmittu@gmail.com",
    "gender": "male",
    "is_verified": false,
    "phone_number": "9908990899",
    "role_id": 1,
    "user_id": 13,
    "user_name": "dmittu"
  }
]

driver[
  {
    "created_at": "Fri, 30 May 2025 12:57:53 GMT",
    "driver_id": 4,
    "driver_name": "dnavaneeth",
    "experience": 3,
    "license_number": "dl989876376827",
    "updated_at": null,
    "user_id": 11
  },
  {
    "created_at": "Fri, 30 May 2025 13:00:18 GMT",
    "driver_id": 5,
    "driver_name": "dmittu",
    "experience": 6,
    "license_number": "td8878tg5723",
    "updated_at": null,
    "user_id": 13
  }
]

roles[
  {
    "role_id": 1,
    "role_name": "Driver"
  },
  {
    "role_id": 2,
    "role_name": "Rider"
  },
  {
    "role_id": 3,
    "role_name": "Admin"
  }
]


stops
[
  {
    "create_datetime": "2025-05-30T13:09:20.294785",
    "route_id": "kondapur_jublieehills",
    "stop_id": 1,
    "stop_name": "kondapur",
    "stop_order": 1,
    "stop_type": "ORIGIN"
  },
  {
    "create_datetime": "2025-05-30T13:13:22.164008",
    "route_id": "kondapur_jublieehills",
    "stop_id": 2,
    "stop_name": "hitechcity",
    "stop_order": 2,
    "stop_type": "INTERMEDIATE"
  },
  {
    "create_datetime": "2025-05-30T13:14:52.530661",
    "route_id": "kondapur_jublieehills",
    "stop_id": 3,
    "stop_name": "madapur",
    "stop_order": 3,
    "stop_type": "INTERMEDIATE"
  },
  {
    "create_datetime": "2025-05-30T13:15:06.498163",
    "route_id": "kondapur_jublieehills",
    "stop_id": 4,
    "stop_name": "durgamcheruvu",
    "stop_order": 4,
    "stop_type": "INTERMEDIATE"
  },
  {
    "create_datetime": "2025-05-30T13:15:28.305183",
    "route_id": "kondapur_jublieehills",
    "stop_id": 5,
    "stop_name": "jublieehills",
    "stop_order": 5,
    "stop_type": "DESTINATION"
  }
]


routestops:
[
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 2,
    "route_id": 1,
    "start_stop_id": 1
  },
  {
    "cost": 40,
    "distance": 4,
    "end_stop_id": 3,
    "route_id": 2,
    "start_stop_id": 1
  },
  {
    "cost": 60,
    "distance": 6,
    "end_stop_id": 4,
    "route_id": 3,
    "start_stop_id": 1
  },
  {
    "cost": 80,
    "distance": 8,
    "end_stop_id": 5,
    "route_id": 4,
    "start_stop_id": 1
  },
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 3,
    "route_id": 5,
    "start_stop_id": 2
  },
  {
    "cost": 40,
    "distance": 4,
    "end_stop_id": 4,
    "route_id": 6,
    "start_stop_id": 2
  },
  {
    "cost": 60,
    "distance": 6,
    "end_stop_id": 5,
    "route_id": 7,
    "start_stop_id": 2
  },
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 4,
    "route_id": 8,
    "start_stop_id": 3
  },
  {
    "cost": 40,
    "distance": 4,
    "end_stop_id": 5,
    "route_id": 9,
    "start_stop_id": 3
  },
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 5,
    "route_id": 10,
    "start_stop_id": 4
  },
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 5,
    "route_id": 11,
    "start_stop_id": 4
  },
  {
    "cost": 20,
    "distance": 2,
    "end_stop_id": 5,
    "route_id": 12,
    "start_stop_id": 4
  }
]







rides
[
  {
    "available_seats": 3,
    "create_datetime": "Sun, 01 Jun 2025 14:33:06 GMT",
    "departure_time": "2025-06-01 15:00:00",
    "destination_stop_id": 5,
    "driver_id": 4,
    "origin_stop_id": 2,
    "ride_id": 2,
    "route_id": 3,
    "status": "Active",
    "update_datetime": "Sun, 01 Jun 2025 14:33:06 GMT"
  },
  {
    "available_seats": 4,
    "create_datetime": "Sun, 01 Jun 2025 14:34:14 GMT",
    "departure_time": "2025-06-02 09:30:00",
    "destination_stop_id": 8,
    "driver_id": 5,
    "origin_stop_id": 4,
    "ride_id": 3,
    "route_id": 2,
    "status": "Active",
    "update_datetime": "Sun, 01 Jun 2025 14:34:14 GMT"
  }
]