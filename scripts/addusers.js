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

function makeUser(row) {
    const user = {
        email: row[0],
        fullname: row[1],
        nickname: row[3],
    };
    return user;
}

let count = 0;
fs.createReadStream("./sql/fakeusers.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", (row) => {
        const user = makeUser(row);
        count++;
        // console.log(user);

        bcrypt.hash("password", 10, async (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
            } else {
                // Salveaza utilizatorul in baza de date
                await db.query(
                    "INSERT INTO users (email, fullname, nickname, userpassword) VALUES ($1, $2, $3, $4)",
                    [user.email, user.fullname, user.nickname, hash]
                );
            }
        }); // Close the callback function properly

    })
    .on("end", () => {
        console.log("CSV file successfully processed");
    })
    .on("error", (err) => {
        console.error("Error processing CSV file:", err);
    });

console.log("Number of users added:", count);
