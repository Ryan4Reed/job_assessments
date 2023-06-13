import os
import json

def parse_html_for_useful_data(directory, names, parser, database):
    with open(directory + '/meta_info.json', 'r') as file:
        json_data = file.read()

    # Convert JSON to dictionary
    meta_info = json.loads(json_data)
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            print(f'Extracting info from {filename}')
            data = parser.find_meta_info(os.path.join(directory, filename), names)
            
            # construct the INSERT query
            placeholders = ', '.join([f"%s" for _ in names])
            values = [data.get(name, None) for name in names]

            insert_query = f"""INSERT INTO articles_meta (url, {', '.join(names)})
                               VALUES (%s, {placeholders})
                                ON CONFLICT (url) DO NOTHING"""
            database.insert_into_table(insert_query, [meta_info[filename.replace('.html', '')]] + values)

    database.close()
