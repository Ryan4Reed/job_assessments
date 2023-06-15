from collections import deque

class QueueManager:
    """
    This class manages a queue of URLs.
    """
    def __init__(self):
        self.queue = deque()

    def add_to_queue(self, urls):
        """
        Add URLs to the queue.

        :param urls: A list of URLs to add to the queue.
        """
        for url in urls:
            self.queue.append(url)

    def get_next_url(self):
        """
        Get the next URL from the queue.

        :return: The next URL from the queue.
        """
        return self.queue.popleft()

    def is_queue_empty(self):
        """
        Check if the queue is empty.

        :return: True if the queue is empty, False otherwise.
        """
        return len(self.queue) == 0
