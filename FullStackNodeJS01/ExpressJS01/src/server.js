require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage, getProductDetail } = require('./controllers/homeController');
const cors = require('cors');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
webAPI.get("/product/:slug", getProductDetail);
app.use('/', webAPI);

app.use('/v1/api/', apiRoutes);

(async () => {
    try {
        await connection();

        const migrateResult = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );
        if (migrateResult.modifiedCount > 0) {
            console.log(`>>> Migration: đã kích hoạt ${migrateResult.modifiedCount} user cũ`);
        }

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()
