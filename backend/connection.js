const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.DB_URL;


// asynchronous function - returns a promise 
mongoose.connect(url)
.then((result) => {
    console.log('database connected');
    
}).catch((err) => {
    console.log(err);
});

module.exports = mongoose;