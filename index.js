
const express = require('express')
const multer = require("multer")
const fs = require('fs')
const bodyParser = require('body-parser')
require("dotenv").config()
const {authRoute} = require('./auth.routes');
const {initDb} = require('./db')
const {bookRoute} = require("./book.routes");

const port = process.env.TOKEN_SERVER_PORT 

const app = express()
// const bookss = [];
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res,next) {
    console.log('request ' + req.url );
    next();
})
app.use(bookRoute);
app.use(authRoute);
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
    const con = await initDb();
    await con.connect();
    await con.close();
})
