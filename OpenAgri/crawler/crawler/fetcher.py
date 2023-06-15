import requests
import logging

class Fetcher:
    """
    This class is responsible for fetching web page data.
    """
    
    def fetch_page(self, url):
        """
        Fetch the content of a web page.

        :param url: URL of the web page to be fetched.
        :return: Text content of the page if successful, None otherwise.
        """
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.text
        except requests.RequestException as e:
            logging.error(f"Error fetching page: {e}")
        return None