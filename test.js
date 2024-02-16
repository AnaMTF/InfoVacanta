import pg from "pg";
import env from "dotenv";

env.config();
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

const result = db.query("SELECT max(reviewid) FROM reviews");
console.log(result);

const starId = result.rows[0].max + 1;
console.log(starId);

