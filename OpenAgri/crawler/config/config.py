class Config:
    """
    This class represents the configuration for the web crawler.
    """
    def __init__(self):
        """
        Initialize the configuration with default values.
        """
        self.max_pages = 100
        self.crawl_delay = 1.0   
        self.num_processes = 5   
        self.include_external = False 

    def update_config(self, max_pages=None, crawl_delay=None, num_processes=None, include_external=None):
        """
        Update configuration values
        :params max_pages: Max number of pages to be scraped
        :params crawl_delay: The delay in seconds between server hits (to make sure news24 server doesn't crash)
        :params num_processes: The number of parallel crawlers to initiate
        :params include_external: Boolean indicating whether non news24 urls should be crawled
        """
        if max_pages is not None:
            self.max_pages = max_pages
        if crawl_delay is not None:
            self.crawl_delay = crawl_delay
        if num_processes is not None:
            self.num_processes = num_processes
        if include_external is not None:
            self.include_external = include_external
        