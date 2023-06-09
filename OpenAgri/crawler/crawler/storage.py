import os
import json

class Storage:
    def __init__(self):
        self.pages_folder = 'pages'
        self.pages = 0
    def save_page(self, html_content, filename):
        try:
            page_filename = os.path.join(self.pages_folder, filename)
            with open(page_filename, 'w', encoding='utf-8') as file:
                file.write(html_content)
            self.pages += 1
            print(f"Page {self.pages} saved successfully.")
        except IOError as e:
            print(f"Error saving page {self.pages}: {str(e)}")
        
    def save_json(self, json_content, filename):
        try:
            with open(filename, 'w') as outfile:
                json.dump(json_content, outfile)
            print(f"Json {filename} saved successfully.")
        except IOError as e:
            print(f"Error saving json {filename}: {str(e)}")    
        