const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://tkyskii2004:VUE18jnI670AcrDw@tkyskii777.0fz0ilv.mongodb.net/?retryWrites=true&w=majority&appName=tkyskii777';

const client = new MongoClient(uri);
const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas', error);
    }
}
async function main() {
    await connectToMongoDB();

}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

main();
