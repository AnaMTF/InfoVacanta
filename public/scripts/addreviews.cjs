const fs = require('fs');
const pg = require('pg');
const env = require('dotenv');
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

fs.readFile('sql/fakereviews2.json', 'utf8', (err, data) => {
    if (err) {
        console.log('Error reading file from disk:', err);
    } else {
        // parse JSON string to JSON object
        const fakeReviews = JSON.parse(data);

        fakeReviews.forEach(async (review) => {
            console.log(review);
            const authorNickname = await db.query('SELECT nickname FROM users WHERE email = $1', [review.email]);
            const destinationId = await db.query('SELECT destinationid FROM destinations WHERE destinationname = $1', [review.destination]);
            db.query(
                "INSERT INTO reviews (authornickname, reviewcategory, reviewbody, destinationId) VALUES ($1, $2, $3, $4);",
                [
                    authorNickname.rows[0].nickname,
                    review.type,
                    review.review,
                    destinationId.rows[0].destinationid
                ]
            );
        });
    }
});