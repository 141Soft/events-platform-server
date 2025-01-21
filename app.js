import express from 'express';
import cors from 'cors';
import { getEvents, postEvent } from './controllers/eventcontrollers.js';

export const app = express();
export const port = process.env.PORT || 3000;


//Middleware
app.use(cors());


//Routes
app.get('/', (req, res) => {
    res.send({ msg: 'Success'})
});

app.get('/events', async (req, res, next) => {
    try {
        const response = await getEvents(req.query);
        res.send(response);
    } catch (error) {
        next(error);
    }
})

//Error Handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Error!' })
})