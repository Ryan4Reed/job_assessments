# Web Crawler

This project is a web crawler implemented in Python. It fetches web pages, extracts useful data, and stores it in a PostgreSQL database.

## Features

- Fetches web pages using the `requests` library.
- Parses HTML content using `BeautifulSoup` to extract links and meta information.
- Manages a URL queue using a `deque` data structure.
- Saves web page content and metadata to the local filesystem using the `Storage` class.
- Connects to a PostgreSQL database using `psycopg2`.
- Configures the crawler using the `Config` class.
- Implements multithreading using the `multiprocessing` module.

## Installation

1. Clone the repository:

    - git clone https://github.com/your-username/web-crawler.git



2. Set up a Conda environment:

   - Navigate to the project directory:
   
     ```
     cd web-crawler
     ```

   - Create a new Conda environment:
   
     ```
     conda create --name web-crawler python=3.8
     ```

   - Activate the Conda environment:
   
     ```
     conda activate web-crawler
     ```

3. Install the required dependencies:

    - conda install --file requirements.txt


4. Set up the PostgreSQL database:

- Create a new database.
- Set the following environment variables in the `.env` file:

  ```
  DB_NAME=your_database_name
  DB_USER=your_database_user
  DB_PASS=your_database_password
  DB_HOST=your_database_host
  DB_PORT=your_database_port
  ```

- Execute the SQL schema file `database/table_schemas/articles_meta.sql` to create the required table.

5. Configure the crawler:

- Adjust the crawler settings in `config/settings.py`.

## Settings

The following settings can be changed in `config/settings.py`:

- `ROOT_URL`: The root URL from which the crawler starts.
- `ROBOTSTXT_URL`: The URL of the `robots.txt` file to respect crawling restrictions. (Note: The current codebase does not utilize the `robots.txt` file of News24 due to known issues with the file.)
- `SITEMAP_URL`: The URL of the sitemap to crawl.
- `MAX_PAGES`: The maximum number of pages to crawl.
- `INCLUDE_EXTERNAL`: A boolean indicating whether to include external links during crawling.
- `NUM_PROCESSES`: The number of parallel processes to use for fetching web pages.
- `META_TAGS`: A list of meta tags to extract from the HTML content.

Update these settings according to your requirements.

## Usage

To run the web crawler, execute the following command:

    - python main.py


The crawler will start fetching web pages, extracting useful data, and saving it to the local filesystem and the PostgreSQL database.

## Notes

- The `robots.txt` file of News24 is known to be faulty and is thus not being utilized in the current codebase. The crawler does not respect crawling restrictions specified in the `robots.txt` file.

## Contributing

Contributions are welcome! If you have suggestions or find any issues, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

