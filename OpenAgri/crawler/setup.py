from database.database import Database

def setup():
    database = Database()
    database.create_table('database/table_schemas/articles_meta.sql')