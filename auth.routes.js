const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require("jsonwebtoken")
const {createUser, findUser} = require("./users");
const fs = require("fs");

const route = express.Router();
// create user
route.post("/createUser", async (req, res) => {
    try{
        if (!req.body.name) return res.status(404).send('name are required')
        if (!req.body.password) return res.status(404).send('password are required')
        const user = req.body.name
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await createUser(user, hashedPassword);
        res.status(201).send('createUser')
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})

//AUTHENTICATE LOGIN
route.post("/login", async (req, res) => {
    try {
        if (!req.body.name) return res.status(404).send('name are required')
        if (!req.body.password) return res.status(404).send('password are required')
        const user = await findUser(req.body.name)
        if (!user) res.status(404).send("User does not exist!")
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = generateAccessToken({user: req.body.name})
            const refreshToken = generateRefreshToken({user: req.body.name})
            res.json({accessToken: accessToken, refreshToken: refreshToken})
        } else {
            res.status(401).send("Password Incorrect!")
        }
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})
route.post("/refreshToken", (req, res) => {
    try{

        if (!req.body.token) return res.status(404).send('token are required')
        if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
        refreshTokens = refreshTokens.filter((c) => c !== req.body.token)
        const accessToken = generateAccessToken({user: req.body.name})
        const refreshToken = generateRefreshToken({user: req.body.name})
        res.json({accessToken: accessToken, refreshToken: refreshToken})
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})
route.delete("/logout", (req, res) => {
    try{
        if (!req.body.token) return res.status(404).send('token are required')
        refreshTokens = refreshTokens.filter((c) => c !== req.body.token)
        res.status(204).send("Logged out!")
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})

// accessTokens
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
}

// refreshTokens
let refreshTokens = []

function generateRefreshToken(user) {
    const refreshToken =
        jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"})
    refreshTokens.push(refreshToken)
    return refreshToken
}

function validateToken(req, res, next) {
    try {
        //get token from request header
        console.log('Entering Api Authorization')
        const authHeader = req.headers["authorization"]
        console.log(authHeader)
        if (!authHeader) res.status(400).send("Token not present")
        const token = authHeader.split(" ")[1]
        //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
        if (token == null) res.status(400).send("Token not present")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(403).send("Token invalid")
            } else {
                req.user = user
                next()
            }
        })
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
}

module.exports = {
    validateToken: validateToken, authRoute: route
}