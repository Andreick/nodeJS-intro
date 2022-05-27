const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

const messages = ['First message', 'Second message'];

app.use(bodyParser.json());

// - [GET] /messages - Return the message list
app.get('/messages', (req, res) => {
    res.send(messages);
});

// - [GET] /messages/{id} - Return a message by id
app.get('/messages/:id', (req, res) => {
    const id = req.params.id - 1;
    const message = messages[id];
    res.send(message);
});

// - [POST] /messages - Create a message
app.post('/messages', (req, res) => {
    const message = req.body.message;
    messages.push(message);
    res.send(`Message created: ${message}`);
});

// - [PUT] /messages/{id} - Update a message by id

// - [DELETE] /messages/{id} - Remove a message by id

app.listen(port, () => {
    console.info(`App running on http://localhost:${port}`);
});
