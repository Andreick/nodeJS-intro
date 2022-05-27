const express = require('express');
const app = express();

const port = 3000;

const messages = ['First message', 'Second message'];

// - [GET] /messages - Return the message list
app.get('/messages', (req, res) => {
    res.send(messages);
});

// - [GET] /messages/{id} - Return the message by id
app.get('/messages/:id', (req, res) => {
    const id = req.params.id - 1;
    const message = messages[id];
    res.send(message);
});

app.listen(port, () => {
    console.info(`App running on http://localhost:${port}`);
});
