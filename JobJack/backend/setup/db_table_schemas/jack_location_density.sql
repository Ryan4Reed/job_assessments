-- Table schema
CREATE TABLE jack_location_density (
  id SERIAL,
  date_column DATE,
  city_id INT,
  province_id INT,
  num_signups INT,
  PRIMARY KEY (id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (province_id) REFERENCES provinces(id),
  UNIQUE(date_column, city_id, province_id)
);