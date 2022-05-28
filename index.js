const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

const port = 3000;

const messages = [
    { id: 1, text: 'First message' },
    { id: 2, text: 'Second message' },
];

const messageBodySchema = Joi.object({
    text: Joi.string().required(),
});

// - [GET] /messages - Return the message list
app.get('/messages', (req, res) => {
    res.send(messages.filter(Boolean));
});

// - [GET] /messages/{id} - Return a message by id
app.get('/messages/:id', (req, res) => {
    const id = +req.params.id;

    const message = getMessageById(id);
    if (!message) {
        sendMessageNotFound(res);
        return;
    }

    res.send(message);
});

// - [POST] /messages - Create a message
app.post('/messages', (req, res) => {
    const { error, value } = validateMessageBody(req.body);
    if (error) {
        sendBadRequest(res, error);
        return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage) value.id = lastMessage.id + 1;
    else value.id = 1;

    messages.push(value);
    res.send(value);
});

// - [PUT] /messages/{id} - Update a message by id
app.put('/messages/:id', (req, res) => {
    const id = +req.params.id;

    const messageIndex = getMessageIndexById(id);
    if (messageIndex === -1) {
        sendMessageNotFound(res);
        return;
    }

    const { error, value } = validateMessageBody(req.body);
    if (error) {
        sendBadRequest(res, error);
        return;
    }

    const message = messages[messageIndex];
    message.text = value.text;
    messages[messageIndex] = message;
    res.send(message);
});

// - [DELETE] /messages/{id} - Remove a message by id
app.delete('/messages/:id', (req, res) => {
    const id = +req.params.id;

    const messageIndex = getMessageIndexById(id);
    if (messageIndex === -1) {
        sendMessageNotFound(res);
        return;
    }

    const message = messages.splice(messageIndex, 1);
    res.send(message[0]);
});

const getMessageById = id => messages.find(msg => msg.id === id);
const getMessageIndexById = id => messages.findIndex(msg => msg.id === id);

const sendMessageNotFound = res => res.status(404).send('Message not found.');

const validateMessageBody = body =>
    messageBodySchema.validate(body, { abortEarly: false });

const sendBadRequest = (res, error) =>
    res.status(400).send(error.details.map(it => it.message).toString());

app.listen(port, () => {
    console.info(`App running on http://localhost:${port}`);
});
