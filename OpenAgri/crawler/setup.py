import logging

def setup(database):
    try:
        database.create_table('database/table_schemas/articles_meta.sql')
    except Exception as e:
        logging.error(f"Error setting up the database: {e}")
        print(f"Error setting up the database: {e}")
