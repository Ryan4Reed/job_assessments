import os
import json

def parse_html_for_useful_data(directory, names, parser, database):
    """
    Parse HTML files in a directory for useful data and insert into the database.

    :param directory: The directory containing the HTML files.
    :param names: List of meta names to extract.
    :param parser: The Parser object for extracting meta information.
    :param database: The Database object for inserting data into the database.
    """
    with open(directory + '/meta_info.json', 'r') as file:
        json_data = file.read()

    meta_info = json.loads(json_data)
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            print(f'Extracting info from {filename}')
            data = parser.find_meta_info(os.path.join(directory, filename), names)
            
            placeholders = ', '.join([f"%s" for _ in names])
            values = [data.get(name, None) for name in names]
            insert_query = f"""INSERT INTO articles_meta (url, {', '.join(names)})
                               VALUES (%s, {placeholders})
                                ON CONFLICT (url) DO NOTHING"""
            database.insert_into_table(insert_query, [meta_info[filename.replace('.html', '')]] + values)

    database.close()
