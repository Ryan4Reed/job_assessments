from collections import deque

class QueueManager:
    def __init__(self):
        self.queue = deque()

    def add_to_queue(self, urls):
        for url in urls:
            self.queue.append(url)

    def get_next_url(self):
        return self.queue.popleft()

    def is_queue_empty(self):
        return len(self.queue) == 0
