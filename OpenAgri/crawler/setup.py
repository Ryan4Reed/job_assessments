import logging

def setup(database):
    """
    Perform the setup of the database by creating necessary tables.

    :param database: The Database object to perform the setup on.
    """
    try:
        database.create_table('database/table_schemas/articles_meta.sql')
    except Exception as e:
        logging.error(f"Error setting up the database: {e}")
        print(f"Error setting up the database: {e}")
