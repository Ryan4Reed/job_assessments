from bs4 import BeautifulSoup
import logging

class Parser:
    def parse_html(self, html_content):
        try:
            links = []
            soup = BeautifulSoup(html_content, 'html.parser')
            # Extract the href attribute from the <a> tags
            for link in soup.find_all('a'):
                href = link.get('href')
                if href:
                    links.append(href)
            return links
        except TypeError as e:
            logging.error(f'Error parsing HTML: {e}')
            return []
