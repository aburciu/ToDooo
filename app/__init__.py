from flask import Flask
from flask.ext.httpauth import HTTPBasicAuth
from flask.ext.cors import CORS

app = Flask(__name__, static_url_path='/static')
cors = CORS(app)
auth = HTTPBasicAuth()

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todooo.db"
app.config["DEBUG"] = True

from app import todooo