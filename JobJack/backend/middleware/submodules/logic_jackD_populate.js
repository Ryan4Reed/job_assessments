const connectionPool = require("../../setup/db_connect");
const { fetchLastSyncDate } = require("../../utils/db_queries");

const runUpdate = async () => {
  try {
    const lastSyncDate = await fetchLastSyncDate();

    const queryString = `
        WITH combined AS (
          SELECT 
            DATE_TRUNC('month', j.sign_up_date::timestamp)::date AS month_date, 
            c.id AS city_id, 
            p.id AS province_id, 
            COUNT(*) as num_signups
          FROM 
            jack_location as j
            JOIN cities c ON j.city = c.city
            JOIN provinces p ON j.province = p.province
          WHERE 
            DATE_TRUNC('month', j.sign_up_date::timestamp)::date > $1 
            AND j.city IS NOT NULL 
            AND j.province IS NOT NULL
          GROUP BY 
            month_date, 
            c.id, 
            p.id
      
          UNION ALL
      
          SELECT 
            DATE_TRUNC('month', j.sign_up_date::timestamp)::date AS month_date, 
            NULL AS city_id, 
            p.id AS province_id, 
            COUNT(*) as num_signups
          FROM 
            jack_location as j
            JOIN provinces p ON j.province = p.province
          WHERE 
            DATE_TRUNC('month', j.sign_up_date::timestamp)::date > $1 
            AND j.province IS NOT NULL
          GROUP BY 
            month_date, 
            p.id
        )
        INSERT INTO jack_location_density (date_column, city_id, province_id, num_signups)
        SELECT month_date, city_id, province_id, num_signups
        FROM combined
        ON CONFLICT (date_column, city_id, province_id) 
        DO UPDATE 
          SET num_signups = jack_location_density.num_signups + EXCLUDED.num_signups;
        ;`;

    await connectionPool.query(queryString, [lastSyncDate]);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  runUpdate,
};
