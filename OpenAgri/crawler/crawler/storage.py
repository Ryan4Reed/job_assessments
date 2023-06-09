import os
import json
import logging

class Storage:
    """
    This class provides methods for saving web page content and JSON data.
    """
    def __init__(self):
        self.pages_folder = 'pages'
        self.meta_info = {}
        self.pages = 0
    def save_page(self, html_content, filename):
        """
        Save the HTML content to a file.

        :param html_content: The HTML content to save.
        :param filename: The filename to use for saving the content.
        """
        try:
            page_filename = os.path.join(self.pages_folder, filename)
            with open(page_filename, 'w', encoding='utf-8') as file:
                file.write(html_content)
            print(f"Page {self.pages} saved successfully.")
            logging.info(f"Page {self.pages} saved successfully.")
            self.pages += 1
        except IOError as e:
            logging.error(f"Error saving page {self.pages}: {str(e)}")
        
    def save_json(self, json_content, filename):
        """
        Save JSON content to a file.

        :param json_content: The JSON content to save.
        :param filename: The filename to use for saving the JSON content.
        """
        try:
            with open(filename, 'w') as outfile:
                json.dump(json_content, outfile)
            print(f"Json {filename} saved successfully.")
            logging.info(f"Json {filename} saved successfully.")
        except IOError as e:
            logging.error(f"Error saving json {filename}: {str(e)}")    
        