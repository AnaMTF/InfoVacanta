import fs from "fs";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import { parse } from "csv-parse";

env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

function makeReview(row) {
    const review = {}
    return review;
}

let count = 0;
fs.createReadStream("./sql/fakereviews.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", (row) => {
        const user = makeUser(row);
        count++;
        // console.log(user);
    })
    .on("end", () => {
        console.log("CSV file successfully processed");
    })
    .on("error", (err) => {
        console.error("Error processing CSV file:", err);
    });

console.log("Number of users added:", count);
