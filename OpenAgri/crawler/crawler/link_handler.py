import re
from config.settings import ROOT_URL

class LinkHandler:
    """
    This class provides methods for processing and storing unique links.
    """
    def __init__(self):
        self.link_memory = set()
        
    def process_links(self, links, include_external):
        """
        Extract and store unique and approved links from a list of links.

        :param links: A list of links to process.
        :param include_external: A boolean indicating whether to include external links.
        :return: A list of unique and approved links.
        """
        unique_links = []
        for link in links:
            processed_link = self.get_processed_link(link, include_external)
            if processed_link and processed_link not in self.link_memory:
                unique_links.append(processed_link)
                self.link_memory.add(processed_link)
        return unique_links

    def get_processed_link(self, link, include_external):
        """
        Process a link based on whether it is external and return the processed link.

        :param link: The link to process.
        :param include_external: A boolean indicating whether to include external links.
        :return: The processed link if it's approved, else None.
        """
        if 'https://' in link:
            return link if include_external else None

        return ROOT_URL + link
    
    def has_date_tag(self, url):
        """
        Check if the URL has a date tag, which is defined as any sequence of eight digits.

        :param url: The URL to check for a date tag.
        :return: True if a date tag is found, False otherwise.
        """
        pattern = r'\b\d{8}\b'
        match = re.search(pattern, url)
        
        if match is not None:
            return True
        return False
