-- Table schema
CREATE TABLE sync_info (
  id SERIAL PRIMARY KEY,
  last_sync_date DATE NOT NULL
);