from pymongo import MongoClient

def getSession():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['livesitter']
    return db