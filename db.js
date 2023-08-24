const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017/trauxit";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);
async function initDb() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("trauxit").command({ ping: 1 });
        await client.db("trauxit").collection('inventory').insertOne({
            item: 'canvas',
            qty: 100,
            tags: ['cotton'],
            size: { h: 28, w: 35.5, uom: 'cm' }
          });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const cursor = client.db("trauxit").collection('inventory').find({});

        console.log(cursor.list);
        return client;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
async function con(){
    await client.connect();
    return client.db('trauxit');
}

async function closeCon(){
    await client.close();
    return true;
}

module.exports = {
    initDb,con,closeCon
}