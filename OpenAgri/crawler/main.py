import multiprocessing
from config.config import Config
from crawler.fetcher import Fetcher
from crawler.parser import Parser
from crawler.link_handler import LinkHandler
from crawler.queue_manager import QueueManager
from crawler.storage import Storage
from config import settings

def main(num_processes: int = 5):
    # Load configuration
    config = Config()
    config.update_config(max_pages=settings.MAX_PAGES)

    # Initialize components
    fetcher = Fetcher()
    parser = Parser()
    link_handler = LinkHandler()
    queue_manager = QueueManager()
    storage = Storage()
    pool = multiprocessing.Pool(processes=num_processes)

    # Start with the root URL
    root_url = settings.ROOT_URL
    queue_manager.add_to_queue([root_url])

    while not queue_manager.is_queue_empty() and storage.pages < config.max_pages:
        urls_to_crawl = []
        for _crawler in range(num_processes):
            if not queue_manager.is_queue_empty():
                url = queue_manager.get_next_url()
                urls_to_crawl.append(url)

        pages = pool.map(fetcher.fetch_page, urls_to_crawl)
        
        for i, page in enumerate(pages):
            if page and storage.pages < config.max_pages:
                links = parser.parse_html(page)
                processed_links = link_handler.process_links(links)
                queue_manager.add_to_queue(processed_links)
                page_num = 'page_' + str(storage.pages)
                storage.save_page(page, f'{page_num}.html')
                storage.meta_info.append({page_num: urls_to_crawl[i]})
    storage.save_json(storage.meta_info, 'pages/meta_info.json')

if __name__ == '__main__':
    main(1)
