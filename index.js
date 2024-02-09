const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 8000;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l7y8quk.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://dnafim081999:szCGr2bOhWGcYqbl@cluster0.l7y8quk.mongodb.net/?retryWrites=true&w=majority";

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

        
        const users = client.db('code').collection('users');
        
        app.get('/api/books', async (req, res) => {

            try {
                const cursor = books.find().sort({ createdAt: -1 });
                const result = await cursor.toArray();
                res.json({
                    status: 200,
                    books: result
                });
            } catch (err) {
                res.json({
                    status: 404,
                    message: `books were not found`,
                    books: result
                });
            }

        })
        
        app.post('/api/users', async (req, res) => {
            const newUsers = req.body;
            try {
                console.log(newUsers);
                const result = await users.insertOne(newUsers);
                res.json({
                    status: 201,
                    message: "Created",
                    books: result
                });
            }
            catch (err) {

            }

        })

        

        app.get('/api/books/:id', async (req, res) => {
            const id = parseInt(req.params.id);

            const query = { id: id };

            try {
                const result = await books.findOne(query);

                if (result) {
                    res.json({
                        status: 200,
                        books: result
                    });
                } else {
                    res.json({
                        status: 404,
                        message: `Book with numberid: ${id} was not found`
                    });
                }

            } catch (err) {

            }
        });




        

        app.put('/api/books/:id', async (req, res) => {
            const id = parseInt(req.params.id);
            const filter = { id: id };

            const updatedBooks = req.body;

            try {

                const ifBookExist = await books.findOne(filter);
                if (!ifBookExist) {
                    return res.status(404).json({
                        status: 404,
                        message: `Book with id: ${id} was not found`
                    });
                }

                const update = {
                    $set: {
                        title: updatedBooks.title,
                        author: updatedBooks.author,
                        genre: updatedBooks.genre,
                        price: updatedBooks.price
                    }
                };

                const result = await books.updateOne(filter, update);

                res.json({
                    status: 200,
                    message: "OK",
                    books: result
                });
            } catch (err) {

            }
        });



        
        app.get('/api/books', async (req, res) => {
            const { title, author, genre, sort, order } = req.query;

            const searchQuery = {};
            if (title) searchQuery.title = title;
            if (author) searchQuery.author = author;
            if (genre) searchQuery.genre = genre;

            const sortCriteria = {};
            if (sort) sortCriteria[sort] = order === 'ASC' ? 1 : -1;

            const cursor = books.find(searchQuery).sort(sortCriteria);
            const result = await cursor.toArray();

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