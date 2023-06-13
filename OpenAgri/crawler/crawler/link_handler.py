import re
from config.settings import INCLUDE_EXTERNAL, ROOT_URL

class LinkHandler:
    def __init__(self):
        self.link_memory = set()
        self.include_external = INCLUDE_EXTERNAL
        
    def process_links(self, links):
        """Extract and store unique and approved links from a list of links."""
        unique_links = []
        for link in links:
            processed_link = self.get_processed_link(link)
            if processed_link and processed_link not in self.link_memory:
                unique_links.append(processed_link)
                self.link_memory.add(processed_link)
        return unique_links

    def get_processed_link(self, link):
        """Process a link based on whether it is external and return the processed link."""
        if 'https://' in link:
            return link if self.include_external else None

        return ROOT_URL + link
    
    def has_date_tag(self, url):
        # This regular expression will match any sequence of eight digits.
        pattern = r'\b\d{8}\b'
        # Search for the pattern
        match = re.search(pattern, url)
        
        if match is not None:
            return True
        return False
