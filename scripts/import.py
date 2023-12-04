import os
import pandas as pd
from pymongo import MongoClient
import bcrypt


def read_csv_file(file_path):
    """
    Reads a CSV file into a pandas DataFrame.
    This method is used to load CSV data into memory for further processing or insertion into a database.

    :param file_path: The path to the CSV file to be read.
    :return: A pandas DataFrame containing the data from the CSV file.
    """
    return pd.read_csv(file_path)


def insert_into_mongo(df, db, collection_name):
    """
    Inserts data from a DataFrame into a MongoDB collection.
    This method first clears any existing data in the specified collection before inserting new data,
    ensuring that the collection reflects the current state of the DataFrame.

    :param df: The pandas DataFrame containing data to be inserted into MongoDB.
    :param db: The MongoDB database connection object.
    :param collection_name: The name of the MongoDB collection where the data will be inserted.
    """
    collection = db[collection_name]
    collection.delete_many({})  # Clear existing data
    records = df.to_dict('records')
    collection.insert_many(records)


def insert_admin_user(db):
    """
    Inserts a hardcoded admin user into the 'user' collection of the MongoDB database.
    This method is useful for creating an initial admin user with a predefined role and password.
    The password is hashed for security before being stored in the database.

    :param db: The MongoDB database connection object.
    """
    users_collection = db['user']
    users_collection.delete_many({})  # Clear existing data

    admin_password = "p"  # Replace with a strong password
    hashed_password = bcrypt.hashpw(
        admin_password.encode('utf-8'), bcrypt.gensalt())

    admin_user = {
        "username": "Admin",
        "password": hashed_password,
        "role": "admin",
        "schedule": []
    }

    users_collection.insert_one(admin_user)


def main():
    """
    The main function of the script.
    It reads CSV files from a specified folder, converts them to DataFrames, and then inserts them
    into a MongoDB database. Additionally, it inserts a hardcoded admin user into the database.

    The MongoDB database and the folder containing the CSV files are specified within the function.
    """
    folder_path = 'cleaned_data/'  # Folder containing CSV files
    db_name = 'CourseCrafterDB'    # Database name

    client = MongoClient("mongodb://localhost:27017/")
    db = client[db_name]

    for filename in os.listdir(folder_path):
        if filename.endswith('.csv'):
            file_path = os.path.join(folder_path, filename)
            df = read_csv_file(file_path)

            # Use filename without '.csv' as collection name
            collection_name = os.path.splitext(filename)[0]
            insert_into_mongo(df, db, collection_name)

    # Insert a hardcoded admin user
    insert_admin_user(db)


if __name__ == "__main__":
    main()
