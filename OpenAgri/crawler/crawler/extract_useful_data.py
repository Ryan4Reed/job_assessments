import os
import psycopg2
from bs4 import BeautifulSoup

# # setup connection
# conn = psycopg2.connect(
#     dbname="openagri_db",
#     user="postgres",
#     password="openpass",
#     host="localhost",
#     port="5454"
# )

# # get a cursor object used to execute SQL commands
# cur = conn.cursor()

def parse_html(file, names):
    with open(file, 'r') as f:
        contents = f.read()
        soup = BeautifulSoup(contents, 'lxml')
        data = {}

        for name in names:
            meta_tag = soup.find('meta', attrs={'name': name})
            if meta_tag is not None:
                content = meta_tag.get('content')
                data[name] = content
        return data

def parse_html_for_useful_data(directory, names):
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            data = parse_html(os.path.join(directory, filename), names)
            
            # construct the INSERT query
            columns_with_placeholders = ', '.join([f"{name} = %s" for name in names])
            values = [data.get(name, None) for name in names]

            # insert_query = f"""INSERT INTO your_table (filename, {', '.join(names)})
            #                    VALUES (%s, {columns_with_placeholders})"""
            # cur.execute(insert_query, [filename] + values)
            # conn.commit()


# # don't forget to close the connection
# conn.close()
