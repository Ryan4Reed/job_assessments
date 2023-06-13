CREATE TABLE IF NOT EXISTS articles_meta (
    id SERIAL PRIMARY KEY,
    url TEXT,
    breadcrumb VARCHAR(255),
    description TEXT,
    keywords TEXT,
    accreditation VARCHAR(255),
    author VARCHAR(255),
    articletitle TEXT,
    publisheddate TIMESTAMP,
    datemodified TIMESTAMP,
    pagetype VARCHAR(50)
);
