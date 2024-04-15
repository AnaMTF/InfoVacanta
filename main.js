import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv";
//import path from "path";

const app = express();
const port = 4000;
const saltRounds = 10;
env.config();

//app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false, //<-- Setarea true necesita HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 30, //<-- 30 de zile
        },
    })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/profil", (req, res) => {
    res.render("profil.ejs", {
        authoremail: req.session.passport.user.email,
        authornickname: req.session.passport.user.nickname,
        authorfullname: req.session.passport.user.fullname
    });
});

// app.get("/modify", (req, res) => {
//     res.render("profil.ejs");
// });

app.get("/statiuni", async (req, res) => {
    console.log("/statiuni");

    if (req.isAuthenticated()) {
        try {
            const result = await db.query(
                "select * from destinations;",
            );
            const destinationsFromDatabase = result.rows;
            res.render("statiuni.ejs", { statiuni: destinationsFromDatabase, user: req.session.passport.user });
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    // Daca utilizatorul este autentificat, redirectioneaza-l catre pagina de secrete
    if (req.isAuthenticated()) {
        res.redirect("/main");
    } else {
        res.render("login.ejs");
    }
});

app.get("/register", (req, res) => {
    // Daca utilizatorul este autentificat, redirectioneaza-l catre pagina de secrete
    if (req.isAuthenticated()) {
        res.redirect("/main");
    } else {
        res.render("register.ejs");
    }
});

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect("/");
    });
});

app.get("/main", async (req, res) => {
    console.log("/main");
    //console.log(req.session.passport.user); //<-- Testare (user primit de la passport)

    if (req.isAuthenticated()) {
        // de facut: API pentru a prelua recenziile din baza de date
        try {
            const result = await db.query(
                "select reviewid, authornickname, reviewcategory, reviewbody, \
                rating, upvotes, dateposted, reviews.destinationid, \
                destinations.destinationname from reviews, destinations where \
                destinations.destinationid = reviews.destinationid;",
            );
            const reviewsFromDatabase = result.rows;
            res.render("main.ejs", { reviews: reviewsFromDatabase, user: req.session.passport.user });
        } catch (err) {
            console.log(err);
        }
    } else {
        res.redirect("/login");
    }
});

app.get("/reviews/delete/:id", async (req, res) => {
    console.log("/reviews/delete/:id");
    console.log(req.params.id); //<-- Testare

    const reviewid = req.params.id;
    try {
        const result = await db.query("DELETE FROM reviews WHERE reviewid = $1", [reviewid]);
        console.log(`Reviewul ${reviewid} a fost sters cu succes!`); //<-- Testare
        res.redirect("/main");
    } catch (err) {
        console.log(err);
    }
});

app.get("/modify/:id", async (req, res) => {
    console.log("/modify/:id");
    console.log(req.params.id); //<-- Testare

    const reviewid = req.params.id;
    try {
        const result = await db.query(
            "SELECT * FROM reviews WHERE reviewid = $1",
            [reviewid]
        );
        const review = result.rows[0];
        const starId = result.rows[0].reviewid;

        const result2 = await db.query(
            "SELECT destinationname FROM destinations WHERE destinationid = $1",
            [review.destinationid]
        );
        const destinationname = result2.rows[0].destinationname;

        console.log(review); //<-- Testare
        res.render("modify.ejs", { heading: "Modifică recenzia", submit: "Publică schimbările", review: review, destinationname: destinationname, starId: starId });
    } catch (err) {
        console.log(err);
    }
});

app.post("/api/reviews/:id", async (req, res) => {
    console.log("/api/reviews/:id");
    console.log(req.params.id); //<-- Testare
    console.log(req.body); //<-- Testare

    const reviewid = req.params.id;
    const reviewdestination = req.body.destinationname;
    const reviewbody = req.body.reviewbody;

    try {
        const result = await db.query(
            "SELECT destinationid, destinationcategory FROM destinations WHERE destinationname = $1",
            [reviewdestination]
        );
        const destinationid = result.rows[0].destinationid;
        const destinationcategory = result.rows[0].destinationcategory;
        const result2 = await db.query(
            "UPDATE reviews SET reviewbody = $1, destinationid = $2, reviewcategory = $3 WHERE reviewid = $4",
            [reviewbody, destinationid, destinationcategory, reviewid]
        );
        res.redirect("/main");
    } catch (err) {
        console.log(err);
    }
});

app.get("/new", async (req, res) => {
    console.log("/new");
    console.log(req.session.passport.user); //<-- Testare (user primit de la passport)

    try {
        const result = await db.query("SELECT max(reviewid) FROM reviews");
        const starId = result.rows[0].max + 1;
        res.render("new.ejs", { heading: "Recenzie nouă", submit: "Publică", starId: starId });
    } catch (err) {
        console.log(err);
    }
});

app.get("/contact", (req, res) => {
    console.log("/contact");
    // console.log(req.session.passport.user);
    if (req.isAuthenticated()) {
        res.render("contact.ejs");
    }
    else {
        res.redirect("/login");
    }
    // res.render("contact.ejs");
});

app.post("/reviews", async (req, res) => {
    console.log("/reviews");
    console.log(req.body);//<-- Testare

    const destinationname = req.body.destinationname;
    const reviewbody = req.body.reviewbody;

    const authornickname = req.session.passport.user.nickname;
    try {
        const result = await db.query(
            "SELECT destinationid, destinationcategory FROM destinations WHERE destinationname = $1",
            [destinationname]
        );
        if (result.rows.length > 0) {
            const destinationid = result.rows[0].destinationid;
            const destinationcategory = result.rows[0].destinationcategory;
            try {
                const result = await db.query(
                    "INSERT INTO reviews (authornickname, reviewcategory, reviewbody, destinationid) VALUES ($1, $2, $3, $4) RETURNING *",
                    [authornickname, destinationcategory, reviewbody, destinationid]
                );
            } catch (err) {
                console.log(err);
            }
            res.redirect("/main");
        }
    } catch (err) {
        console.log(err);
    }
});

// Autentificare cu email si parola
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/main",
        failureRedirect: "/login",
    }), (req, res) => {
        console.log("Login successful");
        req.session.user = req.user;
    }
);

// Autentificare cu Google
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

app.get(
    "/auth/google/main", //<--Redirectionarea utilizatorilor autentificati cu Google catre pagina principala
    passport.authenticate("google", {
        successRedirect: "/main",
        failureRedirect: "/login",
    })
);

app.post("/register", async (req, res) => {
    // Preia datele din formular
    const email = req.body.username;
    const nickname = req.body.nickname;
    const fullname = req.body.fullname;
    const password = req.body.password;

    try {
        const checkResult = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // Verifica daca exista deja un utilizator cu acelasi email
        if (checkResult.rows.length > 0) {
            req.redirect("/login");
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    // Salveaza utilizatorul in baza de date
                    const result = await db.query(
                        "INSERT INTO users (email, fullname, nickname, userpassword) VALUES ($1, $2, $3, $4) RETURNING *",
                        [email, fullname, nickname, hash]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log("Registered successfully"); //<-- Testare
                        res.redirect("/main");
                    });
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
});

// Configurarea strategiilor de autentificare
passport.use(
    "local",
    // Strategie locala de autentificare
    // Parametrului `username` nu trebuie sa i se schimbe numele!

    new Strategy(async function verify(username, password, cb) {
        console.log("username:", username); //<-- Testare
        console.log("password:", password); //<-- Testare
        try {
            const result = await db.query(
                "SELECT * FROM users WHERE email = $1 ",
                [username] //<-- username este email
            );
            // verifica daca exista userul
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.userpassword;

                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        // Eroare la verificarea parolei
                        console.error("Error comparing passwords:", err);

                        // cb: callback
                        return cb(err);
                    } else {
                        if (valid) {
                            // Verificarea parolei a reusit
                            return cb(null, user);
                        } else {
                            // Verificarea parolei a esuat
                            // Va intra pe ramura `failureRedirect` din `passport.authenticate`
                            return cb(null, false);
                        }
                    }
                });
            } else {
                return cb("User not found");
            }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.use(
    // Strategia Google de autentificare
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/google/main",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async (accessToken, refreshToken, profile, cb) => {
            console.log("Google profile:", profile); //<-- Testare
            try {
                const result = await db.query(
                    "SELECT * FROM USERS WHERE email = $1",
                    [profile.email]
                );
                if (result.rows.length === 0) {
                    const newUser = await db.query(
                        "INSERT INTO users (email, userpassword, fullname, nickname) VALUES ($1, $2, $3, $4) RETURNING *",
                        [profile.email, "", profile.displayName, profile.displayName] //<-- Parola este goala pentru ca utilizatorul este autentificat cu Google
                    );
                    cb(null, newUser.rows[0]);
                } else {
                    // Daca utilizatorul exista deja in baza de date, il logam
                    cb(null, result.rows[0]);
                }
            } catch (err) {
                cb(err);
            }
        }
    )
);

// Salveaza si acceseaza detaliile utilizatorului in/din sesiunea locala
passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
