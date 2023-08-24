const {con,closeCon} = require('./db');

async function createUser(userName,password){
    const client = await con();
    const len = await client.collection('users').countDocuments();
    await client.collection('users').insertOne({
        name:userName,password:password,user_id:len
    });
    await closeCon();
    return true;
}

async function findUser(userName){
    const client = await con();
    const user = await client.collection('users').findOne({
        name:userName,
    });
    await closeCon();
    console.log(user)
    return user;
}


module.exports = {
    createUser,findUser
}