from bs4 import BeautifulSoup
import logging

class Parser:
    def find_links(self, html_content):
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
        
    def find_meta_info(self, file, names):
        with open(file, 'r') as f:
            contents = f.read()
            soup = BeautifulSoup(contents, 'lxml')
            data = {}

            for name in names:
                meta_tag = soup.find('meta', attrs={'name': name})
                if meta_tag is not None:
                    content = meta_tag.get('content') if meta_tag.get('content') != '' else None
                    if content:
                        if name == 'author':
                            content = content.replace('Compiled by ', '')
                        
                        data[name] = content.strip()
            return data

