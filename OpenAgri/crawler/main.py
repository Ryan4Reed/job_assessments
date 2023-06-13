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
from crawler.extract_useful_data import parse_html_for_useful_data
from database.database import Database
from setup import setup
from utils.files import clear_directory
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
    database = Database()
    logging.info('Components initialised')

    # Setup database
    setup(database)

    # Start with the root URL
    root_url = settings.ROOT_URL
    queue_manager.add_to_queue([root_url])

    # Clear pages folder
    folder_path = "pages"
    clear_directory(folder_path)

    # Initialise crawler
    crawl(fetcher, parser, link_handler, queue_manager, storage, config, settings)

    names = ['breadcrumb', 
         'description', 
         'keywords', 
         'accreditation',
         'author', 
         'articletitle', 
         'publisheddate', 
         'datemodified', 
         'pagetype']

    parse_html_for_useful_data('pages', names, parser, database)

if __name__ == '__main__':
    main()
