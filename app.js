const express = require('express');
const rateLimit = require('express-rate-limit');
const async = require('async');

const app = express();
const port = 3000;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    message: 'Too many requests, please try again later.',
    headers: true,
});

const requestQueue = async.queue(async (req, res, next) => {
    try {
        await limiter(req, res, next);
    } catch (error) {
        console.error('Error processing request:', error);
        next(error);
    }
}, 1);

app.get('/', (req, res, next) => {
    if (limiter.check(req, res)) {
        res.send('Hello, world!');
    } else {
        requestQueue.push(req, res, next);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});