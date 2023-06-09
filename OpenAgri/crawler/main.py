from config.config import Config
from crawler.fetcher import Fetcher
from crawler.parser import Parser
from crawler.link_handler import LinkHandler
from crawler.queue_manager import QueueManager
from crawler.storage import Storage
from config import settings

def main():
    # Load configuration
    config = Config()
    config.update_config(max_pages=settings.MAX_PAGES)

    # Initialize components
    fetcher = Fetcher()
    parser = Parser()
    link_handler = LinkHandler()
    queue_manager = QueueManager()
    storage = Storage()

    # Start with the root URL
    root_url = settings.ROOT_URL
    queue_manager.add_to_queue(root_url)

    # Crawl until reaching the maximum number of pages or the queue is empty
    meta_info = []
    while not queue_manager.is_queue_empty() and storage.pages < config.max_pages:
        url = queue_manager.get_next_url()
        html_content = fetcher.fetch_page(url)
        if html_content:
            links = parser.parse_html(html_content)
            processed_links = link_handler.process_links(links)
            for link in processed_links:
                queue_manager.add_to_queue(link)
            page = 'page_' + str(storage.pages)
            storage.save_page(html_content, f'{page}.html')
            meta_info.append({page: url})
    storage.save_json(meta_info, 'pages/meta_info.json')
if __name__ == '__main__':
    main()
