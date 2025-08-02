import express from "express";
import http from "http";
// import dotenv from 'dotenv'
// import process from 'process'
import connectDB from './src/config/database.js'
import cors from 'cors'
import routes from './src/routes/index.js'
// dotenv.config();
const app = express();
const port = 3003
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
connectDB();
routes(app);

app.get("/", (req, res) => {
        res.send("Hello World! Xennar");
});
server.listen(port, async () => {
    console.log(`app is running on port`, port)
});