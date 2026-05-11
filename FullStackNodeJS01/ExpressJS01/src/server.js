require('dotenv').config();
//import các nguồn cần dùng
const express = require('express'); //commonjs
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');
const User = require('./models/user');

const app = express(); //cấu hình app là express
//cấu hình port, nếu tìm thấy port trong env, không thì trả về 8888
const port = process.env.PORT || 8888;

app.use(cors());//config cors
app.use(express.json()) // //config req.body cho json
app.use(express.urlencoded({ extended: true })) // for form data

configViewEngine(app);//config template engine

//config route cho view ejs
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

//khai báo route cho API
app.use('/v1/api/', apiRoutes);

(async () => {
    try {
        //kết nối database using mongoose
        await connection();

        // Migration: set isActive = true cho các user cũ chưa có field isActive
        const migrateResult = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );
        if (migrateResult.modifiedCount > 0) {
            console.log(`>>> Migration: đã kích hoạt ${migrateResult.modifiedCount} user cũ`);
        }

        //lắng nghe port trong env
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()