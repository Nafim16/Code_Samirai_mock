const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://dnafim081999:szCGr2bOhWGcYqbl@cluster0.l7y8quk.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        //News Section
        //------------
        const books = client.db('code').collection('books');
        //for reading news
        app.get('/books', async (req, res) => {
            const cursor = books.find().sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })
        //for creating news
        app.post('/books', async (req, res) => {
            const newBooks = req.body;
            console.log(newBooks);
            const result = await books.insertOne(newBooks);
            res.send(result);
        })

        //for updating
        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await books.findOne(query);
            res.send(result);
        })
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedBooks = req.body;
            const update = {
                $set: {
                    title: updatedBooks.title,
                    author: updatedBooks.author,
                    genre: updatedBooks.genre,
                    price: updatedBooks.price
                }
            }
            const result = await books.updateOne(filter, update, options);
            res.send(result);
        })


        // Search and filter books
        app.get('/api/books', async (req, res) => {
            const { title, author, genre, sort, order } = req.query;

            // Build query based on provided search criteria
            const searchQuery = {};
            if (title) searchQuery.title = title;
            if (author) searchQuery.author = author;
            if (genre) searchQuery.genre = genre;

            // Sorting criteria
            const sortCriteria = {};
            if (sort) sortCriteria[sort] = order === 'A' ? 1 : -1;

            // Fetch and sort books
            const cursor = books.find(searchQuery).sort(sortCriteria);
            const result = await cursor.toArray();

            // Wrap the result in a 'books' object
            res.json({ books: result });
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server  is running');
})

app.listen(port, () => {
    console.log(`Current port: ${port}`);
})