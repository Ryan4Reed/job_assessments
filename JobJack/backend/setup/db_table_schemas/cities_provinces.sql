CREATE TABLE cities_provinces (
    id SERIAL PRIMARY KEY,
    city_id INTEGER,
    province_id INTEGER,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);
