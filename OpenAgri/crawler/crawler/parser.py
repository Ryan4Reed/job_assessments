from bs4 import BeautifulSoup
import logging

class Parser:
    """
    This class provides methods for parsing HTML content.
    """
    def find_links(self, html_content):
        """
        Extract all href values from anchor tags in the HTML content.

        :param html_content: HTML content to parse for links.
        :return: A list of href values (links), empty list if parsing fails or no links found.
        """
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            # Extract the href attribute from the <a> tags
            return [link.get('href') for link in soup.find_all('a') if link.get('href')]
        except TypeError as e:
            logging.error(f'Error parsing HTML: {e}')
            return []
        
    def find_meta_info(self, file, names):
        """
        Extract meta information from an HTML file based on provided meta names.

        :param file: Path to the HTML file to parse.
        :param names: List of meta names to find.
        :return: A dictionary with found meta names as keys and corresponding content as values.
        """
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

