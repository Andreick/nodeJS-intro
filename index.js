const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

const messages = [
    {
        id: 1,
        text: 'First message',
    },
    {
        id: 2,
        text: 'Second message',
    },
];

app.use(bodyParser.json());

// - [GET] /messages - Return the message list
app.get('/messages', (req, res) => {
    res.send(messages.filter(Boolean));
});

// - [GET] /messages/{id} - Return a message by id
app.get('/messages/:id', (req, res) => {
    const id = +req.params.id;
    const message = getMessageById(id);
    if (!message) {
        messageNotFound(res);
        return;
    }
    res.send(message);
});

// - [POST] /messages - Create a message
app.post('/messages', (req, res) => {
    const message = req.body;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) message.id = lastMessage.id + 1;
    else message.id = 1;
    messages.push(message);
    res.send(message);
});

// - [PUT] /messages/{id} - Update a message by id
app.put('/messages/:id', (req, res) => {
    const id = +req.params.id;
    const messageIndex = getMessageIndexById(id);
    if (messageIndex === -1) {
        messageNotFound(res);
        return;
    }
    const message = messages[messageIndex];
    message.text = req.body.text;
    messages[messageIndex] = message;
    res.send(message);
});

// - [DELETE] /messages/{id} - Remove a message by id
app.delete('/messages/:id', (req, res) => {
    const id = +req.params.id;
    const messageIndex = getMessageIndexById(id);
    if (messageIndex === -1) {
        messageNotFound(res);
        return;
    }
    const message = messages.splice(messageIndex, 1);
    res.send(message[0]);
});

const getMessageById = id => messages.find(message => message.id === id);
const getMessageIndexById = id =>
    messages.findIndex(message => message.id === id);

const messageNotFound = res => res.send('Message not found.');

app.listen(port, () => {
    console.info(`App running on http://localhost:${port}`);
});
