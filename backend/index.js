// importing express
const express = require('express');
const app = express();
require('dotenv').config();
const UserRouter = require('./routers/UserRouter');
const AiRouter = require('./routers/AiRouter');
const cors = require('cors');

//initializing express

const port = process.env.PORT || 5000;

// middlewares
app.use(cors({origin: '*'})); // to allow cross-origin requests
app.use(express.json()); // to parse json data
app.use('/user', UserRouter);
app.use('/code', AiRouter);


// endpoints or routes
app.get('/', (request,response) => {
    response.send('Hello world!');
})

app.get('/add', (request,response) => {
    response.send('response from add');
})

app.get('/getall', (request,response) => {
    response.send('response from get all');
})

app.get('/delete', (request,response) => {
    response.send('response from delete');
})  

app.get('/update', (request,response) => {
    response.send('response from update');
})

// starting the server
app.listen(port, () => {
    console.log('server started');
});

