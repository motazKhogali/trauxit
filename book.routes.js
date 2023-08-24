const {validateToken} = require("./auth.routes");
const express = require('express');
const {insertBook, books, bookById, updateBook, deleteBook} = require("./books");
const multer = require("multer");
const fs = require("fs");
const app = express.Router();
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

app.post('/book/create',validateToken, uploadStorage.single("file"), async (req, res) => {
    try{

        if (!req.body.book_name) return res.status(404).send('book_name are required')
        if (!req.body.book_file) return res.status(404).send('book_file are required')
        const book = {
            book_name: req.body.book_name,
            book_file: req.file.book_file,
        }
        await insertBook(book.book_name, book.book_file);
        // bookss.push(book)
        res.send(book);
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})
app.get('/book',validateToken, async (req, res) => {
    try {
        const bs = await books()
        res.send(bs)
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})
app.get('/book/:id',validateToken, async (req, res) => {
    try{
        if (!req.params.id) return res.status(404).send('book_id are required')
        console.log(req.params)
        const book = await bookById(req.params.id)
        // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
        if (book) {
            res.send(book);
        } else {
            res.status(404).send("not Found 404")
        }

    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})

app.put('/book/:id',validateToken ,uploadStorage.single("file"), async (req, res) => {
    try{
        if (!req.params.id) return res.status(404).send('book_id are required')
        const book = await bookById(req.params.id)
        console.log(book);
        // const _book_index = bookss.map((e) => e.id).indexOf(parseInt(req.params.id));
        if (book) {
            if (req.body.bookName) {
                book.book_name = req.body.bookName;
            }
            if (req.file) {
                book.book_file = req.file.filename;
            }
            const result = await updateBook(book.book_id, book.book_name, book.book_file)
            res.send(result);
        } else {
            res.status(404).send("not Found 404")
        }

    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})

app.delete('/book/:id', validateToken, async (req, res) => {
    try {
        if (!req.params.id) return res.status(404).send('book_id are required')
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
    }catch (e) {
        fs.appendFile('error.log', e + '  \n\n', function () {
            console.log("write Error done ")
        });
        res.status(503).send('Server Error');
    }
})

module.exports = {
    bookRoute:app
}