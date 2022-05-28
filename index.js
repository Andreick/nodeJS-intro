const express = require('express');
const Joi = require('joi');
const mongodb = require('mongodb');

const app = express();
app.use(express.json());
const ObjectId = mongodb.ObjectId;

const port = 3000;
const connectionString = 'mongodb://localhost:27017';

(async () => {
    console.info('Connecting to MongoDB...');

    const options = { useUnifiedTopology: true };
    const client = await mongodb.MongoClient.connect(connectionString, options);

    const db = client.db('messaging');
    const messages = db.collection('messages');

    const messageBodySchema = Joi.object({
        text: Joi.string().required(),
    });

    // - [GET] /messages - Return the message list
    app.get('/messages', async (req, res) => {
        res.send(await getAllMessages());
    });

    // - [GET] /messages/{id} - Return a message by id
    app.get('/messages/:id', async (req, res) => {
        const id = req.params.id;

        const message = await getMessageById(id);
        if (!message) {
            sendMessageNotFound(res);
            return;
        }

        res.send(message);
    });

    // - [POST] /messages - Create a message
    app.post('/messages', async (req, res) => {
        const { error, value } = validateMessageBody(req.body);
        if (error) {
            sendBadRequest(res, error);
            return;
        }

        await messages.insertOne(value);
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

    const getAllMessages = () => messages.find({}).toArray();

    const getMessageById = id => messages.findOne({ _id: ObjectId(id) });

    const getMessageIndexById = id => messages.findIndex(msg => msg.id === id);

    const sendMessageNotFound = res =>
        res.status(404).send('Message not found.');

    const validateMessageBody = body =>
        messageBodySchema.validate(body, { abortEarly: false });

    const sendBadRequest = (res, error) =>
        res.status(400).send(error.details.map(it => it.message).toString());

    app.listen(port, () => {
        console.info(`App running on http://localhost:${port}`);
    });
})();
