const bcrypt = require ('bcrypt')
const express = require('express');
const jwt = require("jsonwebtoken")
const users = []
const route = express.Router();
// create user
route.post ("/createUser", async (req,res) => {
    const user = req.body.name
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push ({user: user, password: hashedPassword})
    res.status(201).send(users)
    console.log(users)
})

//AUTHENTICATE LOGIN
route.post("/login", async (req,res) => {
    const user = users.find( (c) => c.user == req.body.name)
    if (!user) res.status(404).send ("User does not exist!")
    if (await bcrypt.compare(req.body.password, user.password)) {
        const accessToken = generateAccessToken ({user: req.body.name})
        const refreshToken = generateRefreshToken ({user: req.body.name})
        res.json ({accessToken: accessToken, refreshToken: refreshToken})  
    }  
    else {
        res.status(401).send("Password Incorrect!")
    }
})
route.post("/refreshToken", (req,res) => {
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    const accessToken = generateAccessToken ({user: req.body.name})
    const refreshToken = generateRefreshToken ({user: req.body.name})
    res.json ({accessToken: accessToken, refreshToken: refreshToken})
})
route.delete("/logout", (req,res)=>{
    refreshTokens = refreshTokens.filter( (c) => c != req.body.token)
    res.status(204).send("Logged out!")
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
        //get token from request header
        console.log('Entering Api Authorization')
        const authHeader = req.headers["authorization"]
        console.log(authHeader)
        if(!authHeader) res.status(400).send("Token not present")
        const token = authHeader.split(" ")[1]
        //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
        if (token == null) res.status(400).send("Token not present")
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) { 
                res.status(403).send("Token invalid")
            }
            else {
                req.user = user
                next() 
            }
        }) 
    } 
    module.exports = {
        validateToken:validateToken,authRoute:route
    }