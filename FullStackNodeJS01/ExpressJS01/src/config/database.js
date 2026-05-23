require('dotenv').config();
const mongoose = require('mongoose');

const connection = async () => {
    await mongoose.connect(process.env.MONGO_DB_URL);
    const state = mongoose.connection.readyState;
    const labels = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    console.log(labels[state] || 'Unknown', 'to database');
};

module.exports = connection;