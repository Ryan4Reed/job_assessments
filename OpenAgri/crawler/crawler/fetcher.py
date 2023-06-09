import requests

class Fetcher:
    def fetch_page(self, url):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.text
        except requests.RequestException as e:
            print(f"Error fetching page: {e}")
        return None