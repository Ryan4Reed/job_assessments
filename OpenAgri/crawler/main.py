import logging
from config.config import Config
from crawler.fetcher import Fetcher
from crawler.parser import Parser
from crawler.link_handler import LinkHandler
from crawler.queue_manager import QueueManager
from crawler.storage import Storage
from config import settings
from crawler.crawl_pages import crawl
from crawler.extract_useful_data import parse_html_for_useful_data
from database.database import Database
from setup import setup
from utils.files import clear_directory

logging.basicConfig(filename='./logs/crawler.log', level=logging.INFO)

def main():
    try:
        # Load configuration
        config = Config()
        config.update_config(max_pages=settings.MAX_PAGES,
                            num_processes=settings.NUM_PROCESSES,
                            include_external=settings.INCLUDE_EXTERNAL)

        # Initialize parser components
        fetcher = Fetcher()
        parser = Parser()
        link_handler = LinkHandler()
        queue_manager = QueueManager()
        storage = Storage()

        logging.info('Parser components initialised')

        # Setup database
        database = Database()
        setup(database)
        
        logging.info('Database setup successful')

        # Clear pages folder
        folder_path = "pages"
        clear_directory(folder_path)

        # Initialise crawler
        crawl(fetcher, parser, link_handler, queue_manager, storage, config, settings)

        # Extract info for crawled pages
        parse_html_for_useful_data('pages', settings.META_TAGS, parser, database)

    except Exception as e:
        logging.error(f"An error occurred in the main function: {e}")
        raise


if __name__ == '__main__':
    main()
