import logging
logging.basicConfig(filename='./logs/crawler.log', level=logging.INFO)
from config.config import Config
from crawler.fetcher import Fetcher
from crawler.parser import Parser
from crawler.link_handler import LinkHandler
from crawler.queue_manager import QueueManager
from crawler.storage import Storage
from config import settings
from crawler.crawl_pages import crawl

def main():
    # Load configuration
    config = Config()
    config.update_config(max_pages=settings.MAX_PAGES,
                         num_processes=settings.NUM_PROCESSES)

    # Initialize components
    fetcher = Fetcher()
    parser = Parser()
    link_handler = LinkHandler()
    queue_manager = QueueManager()
    storage = Storage()
    logging.info('Components initialised')

    # Start with the root URL
    root_url = settings.ROOT_URL
    queue_manager.add_to_queue([root_url])

    # Initialise crawler
    crawl(fetcher, parser, link_handler, queue_manager, storage, config)
    
if __name__ == '__main__':
    main()
