const connectionPool = require("../setup/db_connect");

const extractMiddleware = async (req, res, next) => {
  try {
    console.log("query started");
    const excempted = [
      "western cape",
      "eastern cape",
      "north west",
      "kwazulu natal",
      "gauteng",
      "northern cape",
      "limpopo",
      "mpumalanga",
      "free state",
    ];

    try {
      // Fetch last sync date
      const syncInfoRes = await connectionPool.query(
        "SELECT MAX(last_sync_date) FROM sync_info"
      );
      let lastSyncDate = syncInfoRes.rows[0].max;

      // If lastSyncDate is null, set it to '2000-01-01'
      if (!lastSyncDate) {
        lastSyncDate = "2000-01-01";
      }

      // Fetch months from jack_location where sign_up_date > lastSyncDate
      const monthsRes = await connectionPool.query(
        "SELECT DISTINCT DATE_TRUNC('month', CAST(sign_up_date AS TIMESTAMP)) AS month FROM jack_location WHERE CAST(sign_up_date AS TIMESTAMP) > $1 ORDER BY month",
        [lastSyncDate]
      );
      const months = monthsRes.rows;
      console.log(months);

      for (let month of months) {
        let offset = 0;
        const limit = 100; // Adjust this number according to your needs

        while (true) {
          // Fetch a chunk of rows from jack_location for a specific month
          const jackLocationRes = await connectionPool.query(
            `SELECT * FROM jack_location
                   WHERE DATE_TRUNC('month', CAST(sign_up_date AS TIMESTAMP)) = $1 AND CAST(sign_up_date AS TIMESTAMP) > $2
                   ORDER BY CAST(sign_up_date AS TIMESTAMP)
                   LIMIT $3 OFFSET $4`,
            [month.month, lastSyncDate, limit, offset]
          );
          const jackLocationRows = jackLocationRes.rows;

          if (jackLocationRows.length === 0) {
            break; // No more rows for this month
          }
          for (let row of jackLocationRows) {
            if (row.full_location) {
              const fullLocationParts = row.full_location.split(", ");

              for (let part of fullLocationParts) {
                // Trim part and check if it is a city
                const trimmedPart = part.trim().toLowerCase();
                console.log(trimmedPart);
                if (
                  !/\d/.test(trimmedPart) &&
                  !excempted.includes(trimmedPart)
                ) {
                  const cityRes = await connectionPool.query(
                    "SELECT * FROM cities WHERE city = $1",
                    [trimmedPart]
                  );

                  const cityRows = cityRes.rows;
                  console.log(cityRows);

                  // if (cityRows.length > 0) {
                  //   // Check province correspondence
                  //   const cityId = cityRows[0].id;
                  //   const citiesProvincesRes = await connectionPool.query(
                  //     "SELECT * FROM cities_provinces WHERE city = $1",
                  //     [cityId]
                  //   );
                  //   const citiesProvincesRow = citiesProvincesRes.rows[0];

                  //   if (citiesProvincesRow) {
                  //     const provinceId = citiesProvincesRow.province;
                  //     const provinceRes = await connectionPool.query(
                  //       "SELECT * FROM provinces WHERE id = $1",
                  //       [provinceId]
                  //     );
                  //     const provinceRow = provinceRes.rows[0];

                  //     if (
                  //       provinceRow &&
                  //       fullLocationParts.includes(provinceRow.province)
                  //     ) {
                  //       console.log(
                  //         `Matched city: ${part}, province: ${provinceRow.province}`
                  //       );
                  //     }
                  //   }
                  // }
                }
              }
            }
          }

          offset += limit; // Move to the next chunk
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      await connectionPool.end();
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = extractMiddleware;
