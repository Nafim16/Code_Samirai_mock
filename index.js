const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 8000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l7y8quk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db('code');
        const users = db.collection('users');
        const wallets = db.collection('wallets');
        const stations = db.collection('stations');
        const trains = db.collection('trains');

        // Add User
        // Add User
        app.post('/api/users', async (req, res) => {
            try {
                const newUser = req.body;
                const result = await users.insertOne(newUser);
                if (result && result.ops && result.ops.length > 0) {
                    res.status(201).json(result.ops[0]);
                } else {
                    console.error("Error adding user: No valid result returned from insertOne operation");
                    res.status(500).json({ message: "Internal server error" });
                }
            } catch (error) {
                console.error("Error adding user:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });


        // Get Wallet Balance
        app.get('/api/wallets/:wallet_id', async (req, res) => {
            try {
                const { wallet_id } = req.params;
                const wallet = await wallets.findOne({ wallet_id: parseInt(wallet_id) });
                if (wallet) {
                    res.status(200).json(wallet);
                } else {
                    res.status(404).json({ message: `Wallet with id: ${wallet_id} was not found` });
                }
            } catch (error) {
                console.error("Error getting wallet balance:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Add Wallet Balance
        app.put('/api/wallets/:wallet_id', async (req, res) => {
            try {
                const { wallet_id } = req.params;
                const { recharge } = req.body;
                const wallet = await wallets.findOne({ wallet_id: parseInt(wallet_id) });
                if (wallet) {
                    const updatedBalance = wallet.wallet_balance + recharge;
                    if (recharge >= 100 && recharge <= 10000) {
                        await wallets.updateOne({ wallet_id: parseInt(wallet_id) }, { $set: { 
                            wallet_balance: updatedBalance } });
                        res.status(200).json({
                            wallet_id: wallet.wallet_id,
                            wallet_balance: updatedBalance,
                            wallet_user: {
                                user_id: wallet.wallet_id,
                                user_name: wallet.user_name
                            }
                        });
                    } else {
                        res.status(400).json({ message: `Invalid amount: ${recharge}` });
                    }
                } else {
                    res.status(404).json({ message: `Wallet with id: ${wallet_id} was not found` });
                }
            } catch (error) {
                console.error("Error adding wallet balance:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Add Station
        app.post('/api/stations', async (req, res) => {
            try {
                const newStation = req.body;
                const result = await stations.insertOne(newStation);
                res.status(201).json(result.ops[0]);
            } catch (error) {
                console.error("Error adding station:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // List All Stations
        app.get('/api/stations', async (req, res) => {
            try {
                const stationsList = await stations.find().toArray();
                res.status(200).json({ stations: stationsList });
            } catch (error) {
                console.error("Error listing stations:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // List Trains for a Station
        app.get('/api/stations/:station_id/trains', async (req, res) => {
            try {
                const { station_id } = req.params;
                const trainsList = await trains.find({ "stops.station_id": parseInt(station_id) }).toArray();
                const formattedTrains = trainsList.map(train => {
                    const stop = train.stops.find(stop => stop.station_id === parseInt(station_id));
                    return {
                        train_id: train.train_id,
                        arrival_time: stop.arrival_time,
                        departure_time: stop.departure_time
                    };
                });
                res.status(200).json({ station_id: parseInt(station_id), trains: formattedTrains });
            } catch (error) {
                console.error("Error listing trains for station:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Add Train
        app.post('/api/trains', async (req, res) => {
            try {
                const newTrain = req.body;
                const result = await trains.insertOne(newTrain);
                res.status(201).json(result.ops[0]);
            } catch (error) {
                console.error("Error adding train:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Purchase Ticket
        app.post('/api/tickets', async (req, res) => {
            try {
                // Implement logic for purchasing tickets
            } catch (error) {
                console.error("Error purchasing ticket:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        // Plan Optimal Routes
        app.get('/api/routes', async (req, res) => {
            try {
                // Implement logic for planning optimal routes
            } catch (error) {
                console.error("Error planning optimal routes:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Handle any cleanup or additional logic here
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
