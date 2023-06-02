CREATE TABLE cities_provinces (
    id SERIAL PRIMARY KEY,
    city_id INTEGER,
    province_id INTEGER,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);