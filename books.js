const {con,closeCon} = require('./db');


async function insertBook(bookName,bookFile){
    const client = await con();
    const len = await client.collection('books').countDocuments();
    await client.collection('books').insertOne({
        book_name:bookName,book_file:bookFile,book_id:len
      });
    await closeCon();
}

async function books(){
    const client = await con();
    return await client.collection('books').find().toArray();
}

async function bookById(id){
    const client = await con();
    return await client.collection('books').findOne({book_id:parseInt(id),},{});
}

async function updateBook(id,name,file){
    const client = await con();
    return await client.collection('books').updateOne({book_id:parseInt(id)},{
        $set:{
            book_name:name,book_file:file
        }
    });
}
async function deleteBook(id,name,file){
    const client = await con();
    return await client.collection('books').deleteOne({book_id:parseInt(id)});
}
module.exports = {
    insertBook,books,bookById,updateBook,deleteBook
}