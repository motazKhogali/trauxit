
const express = require('express')
const multer = require("multer")
const fs = require('fs')
const bodyParser = require('body-parser')

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
const port = 3000
const books = [];
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function (req, res,next) {
    console.log('request ' + req.url );
    next();
})
app.post('/book/create', uploadStorage.single("file"), (req, res) => {
    const book = {
        id:books.length,
        book_name: req.body.bookName,
        book_file: req.file.filename,
    }
    books.push(book)
    res.send(book);
})
app.get('/book', (req, res) => {
    res.send(books)
})
app.get('/book/:id', (req, res) => {
    console.log(req.params)
    const _book_index = books.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (_book_index >= 0){
        res.send(books[_book_index]);
    }
    else{
        res.status(404).send("not Found 404")
    }
})

app.put('/book/:id', uploadStorage.single("file"),(req, res) => {
    const _book_index = books.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (_book_index >= 0){
        if (req.body.bookName) {
            books[_book_index].book_name = req.body.bookName;
        }
        if (req.file){
            books[_book_index].book_file = req.file.filename;
        }
        res.send(books[_book_index]);
    }
    else{
        res.status(404).send("not Found 404")
    }
})

app.delete('/book/:id', (req, res) => {
    const _book_index = books.map((e) => e.id).indexOf(parseInt(req.params.id));
    if (_book_index >= 0){
        books.splice(_book_index,1);
        res.send('deleted book with id:' + req.params.id + ' successfully')
    } else{
        res.status(404).send("not Found 404")
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
