require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage, getProductDetail } = require('./controllers/homeController');
const cors = require('cors');
const User = require('./models/user');
const { seedProductsIfEmpty } = require('./services/productService');

const app = express();
const port = process.env.PORT || 8888;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Cho phép requests không có origin (ví dụ: Postman, mobile app)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin "${origin}" không được phép.`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomepage);
webAPI.get('/product/:slug', getProductDetail);
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

        // Migration: Lowercase all roles in DB
        const usersToMigrate = await User.find({ role: { $exists: true } });
        let updatedRolesCount = 0;
        for (const u of usersToMigrate) {
            if (u.role && u.role !== u.role.toLowerCase()) {
                u.role = u.role.toLowerCase();
                await u.save();
                updatedRolesCount++;
            }
        }
        if (updatedRolesCount > 0) {
            console.log(`>>> Migration: đã chuyển đổi ${updatedRolesCount} user sang role chữ thường`);
        }

        await seedProductsIfEmpty();

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log('>>> Error connect to DB: ', error);
    }
})();
