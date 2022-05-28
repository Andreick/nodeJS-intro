require('dotenv').config();
const express = require('express');
const Joi = require('joi');
const mongodb = require('mongodb');

const app = express();
app.use(express.json());
const ObjectId = mongodb.ObjectId;

(async () => {
    console.info('Connecting to MongoDB...');

    const options = { useUnifiedTopology: true };
    const client = await mongodb.MongoClient.connect(
        process.env.DB_CONNECTION_STRING,
        options,
    );

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
    app.put('/messages/:id', async (req, res) => {
        const { error, value } = validateMessageBody(req.body);
        if (error) {
            sendBadRequest(res, error);
            return;
        }

        const id = req.params.id;

        const { matchedCount } = await messages.updateOne(
            {
                _id: ObjectId(id),
            },
            {
                $set: value,
            },
        );

        if (matchedCount !== 1) {
            sendMessageNotFound(res);
            return;
        }

        res.send(await getMessageById(id));
    });

    // - [DELETE] /messages/{id} - Remove a message by id
    app.delete('/messages/:id', async (req, res) => {
        const id = req.params.id;

        const { deletedCount } = await messages.deleteOne({
            _id: ObjectId(id),
        });

        if (deletedCount != 1) {
            sendMessageNotFound(res);
            return;
        }

        res.send('Message deleted.');
    });

    const getAllMessages = () => messages.find({}).toArray();

    const getMessageById = id => messages.findOne({ _id: ObjectId(id) });

    const sendMessageNotFound = res =>
        res.status(404).send('Message not found.');

    const validateMessageBody = body =>
        messageBodySchema.validate(body, { abortEarly: false });

    const sendBadRequest = (res, error) =>
        res.status(400).send(error.details.map(it => it.message).toString());

    app.listen(process.env.PORT, () => {
        console.info(`App running on http://localhost:${process.env.PORT}`);
    });
})();
