import os
from dotenv import load_dotenv
 
load_dotenv()
 
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")

class DevConfig:
    SQLALCHEMY_DATABASE_URI = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "options": "-c search_path=carconnect"
        }
    }
 


