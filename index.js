
const express = require('express')
const multer = require("multer")
const fs = require('fs')
const bodyParser = require('body-parser')
require("dotenv").config()
const {authRoute,validateToken} = require('./auth');
const {initDb} = require('./db')
const { insertBook,books,bookById, updateBook, deleteBook} = require('./books')

const port = process.env.TOKEN_SERVER_PORT 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderName = 'books';
        if (!fs.existsSync(folderName)){
            fs.mkdirSync(folderName);
        }
        cb(null, folderName + "/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    },
})
const uploadStorage = multer({ storage: storage })

const app = express()
const bookss = [];
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res,next) {
    console.log('request ' + req.url );
    next();
})
app.post('/book/create',validateToken, uploadStorage.single("file"), async (req, res) => {
    const book = {
        id:bookss.length,
        book_name: req.body.bookName,
        book_file: req.file.filename,
    }
    await insertBook(book.book_name,book.book_file);
    bookss.push(book)
    res.send(book);
})
app.get('/book',validateToken, async (req, res) => {
    const bs = await books()
    res.send(bs)
})
app.get('/book/:id',validateToken, async (req, res) => {
    console.log(req.params)
    const book = await bookById(req.params.id)
    // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (book){
        res.send(book);
    }
    else{
        res.status(404).send("not Found 404")
    }
})

app.put('/book/:id',validateToken ,uploadStorage.single("file"), async (req, res) => {
    const book = await bookById(req.params.id)
    console.log(book);
    // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (book){
        if (req.body.bookName) {
            book.book_name = req.body.bookName;
        }
        if (req.file){
            book.book_file = req.file.filename;
        }
        const result = await updateBook(book.book_id,book.book_name,book.book_file)
        res.send(result);
    }
    else{
        res.status(404).send("not Found 404")
    }
})

app.delete('/book/:id', validateToken, async (req, res) => {
    // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
    // if (_book_index >= 0){
    //     bookss.splice(_book_index,1);
    //     res.send('deleted book  id:' + req.params.id + ' successfully')
    // } else{
    //     res.status(404).send("not Found 404")
    // }
    const book = await bookById(req.params.id)
    console.log(book);
    // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (book){
        const result = await deleteBook(book.book_id)
        res.send(result);
    }
    else{
        res.status(404).send("not Found 404")
    }
})
app.use(authRoute)
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
    const con = await initDb();
    await con.connect();
con.db('trauxit').createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
})
