import logging
import multiprocessing

def crawl(fetcher, parser, link_handler, queue_manager, storage, config, settings):
    try:
        print('Crawler started')
        logging.info('Crawler started')
        pool = multiprocessing.Pool(processes=config.num_processes)
        while not queue_manager.is_queue_empty() and storage.pages < config.max_pages:
            urls_to_crawl = []
            for _crawler in range(config.num_processes):
                if not queue_manager.is_queue_empty():
                    url = queue_manager.get_next_url()
                    urls_to_crawl.append(url)
            logging.info(f'Started fetching the following urls: {urls_to_crawl}')
            pages = pool.map(fetcher.fetch_page, urls_to_crawl)
            logging.info('Completed fetching url cluster')
            for i, page in enumerate(pages):
                if page and storage.pages < config.max_pages:
                    links = parser.find_links(page)
                    processed_links = link_handler.process_links(links)
                    queue_manager.add_to_queue(processed_links)
                    logging.info(f'New links added the queue: {processed_links}')
                    
                    should_save = link_handler.has_date_tag(urls_to_crawl[i])
                    if should_save:
                        page_num = 'page_' + str(storage.pages)
                        storage.save_page(page, f'{page_num}.html')
                        storage.meta_info[page_num] = urls_to_crawl[i]
        storage.save_json(storage.meta_info, 'pages/meta_info.json')
        print('Crawler completed')
        logging.info('Crawler completed')

    except Exception as e:
        logging.error(f'An error occurred while processing {urls_to_crawl}: {e}')