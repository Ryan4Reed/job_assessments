import psycopg2
import os
from dotenv import load_dotenv

class Database:
    """
    This class provides methods for interacting with a PostgreSQL database.
    """
    def __init__(self):
        load_dotenv()
        self.conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        self.cursor = self.conn.cursor()

    def create_table(self, sql_file):
        """
        Create a database table using SQL statements from a file.

        :param sql_file: The path to the SQL file containing the table creation statements.
        """
        try:
            with open(sql_file, 'r') as file:
                self.cursor.execute(file.read())
            self.conn.commit()
            print('Db table created')
        except (psycopg2.Error, FileNotFoundError) as e:
            print(f"Error creating table: {e}")
            self.conn.rollback()  

    def insert_into_table(self, query, data):
        """
        Execute an INSERT query to insert data into a database table.

        :param query: The INSERT query string.
        :param data: The data to be inserted into the table.
        """
        try:
            self.cursor.execute(query, data)
            self.conn.commit()
        except psycopg2.Error as e:
            print(f"Error inserting into table: {e}")
            self.conn.rollback()  


    def close(self):
        """
        Close the database cursor and connection.
        """
        self.cursor.close()
        self.conn.close()
