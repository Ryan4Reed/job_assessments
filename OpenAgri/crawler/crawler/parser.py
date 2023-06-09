from bs4 import BeautifulSoup

class Parser:
    def parse_html(self, html_content):
        links = []
        soup = BeautifulSoup(html_content, 'html.parser')
        # Extract the href attribute from the <a> tags
        for link in soup.find_all('a'):
            href = link.get('href')
            if href:
                links.append(href)
        return links
