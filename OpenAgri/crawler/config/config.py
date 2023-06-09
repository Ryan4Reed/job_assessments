class Config:
    def __init__(self):
        # Default configuration values
        self.max_pages = 100
        self.crawl_delay = 1.0       

    def update_config(self, max_pages=None, crawl_delay=None):
        # Update configuration values
        if max_pages is not None:
            self.max_pages = max_pages
        if crawl_delay is not None:
            self.crawl_delay = crawl_delay


# Add config wrt whether we want to crawl external webpages or only webpages with the default base url