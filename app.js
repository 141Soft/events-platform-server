import express from 'express';
import cors from 'cors';
import { getEvents, getTags, postEvent } from './controllers/eventcontrollers.js';
import { getUser, postUser } from './controllers/usercontrollers.js';

export const app = express();
export const port = process.env.PORT || 3000;


//Middleware
app.use(cors({
    origin:'http://localhost:5173'
}));

app.use(express.json());


//Routes
app.get('/', (req, res) => {
    res.send({ msg: 'Success'})
});

app.get('/events', async (req, res, next) => {
    try {
        const response = await getEvents(req.query);
        res.send(response);
    } catch (err) {
        next(err);
    }
})

app.get('/events/tags', async (req, res, next) => {
    try {
        const response = await getTags();
        res.send(response);
    } catch (err) {
        next(err)
    }
})

app.get('/users', async (req, res, next) => {
    try {
        const response = await getUser(req.query);
        res.send(response);
    } catch (err) {
        next(err);
    }
})

app.post('/users', async (req, res, next) => {
    try {
        const response = await postUser(req.body);
        res.status(201).send(response);
    } catch(err) {
        next(err);
    }
})

//Error Handling

app.use((err, req, res, next) => {
    if(err.code === "ECONNREFUSED"){
        console.error(err);
        res.status(503).send({ error: 'Database not initialised' });
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    if(err.message === "Params Required"){
        console.error(err);
        res.status(404).send({ error: 'User params not defined' });
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    if(err.message === "No User Found"){
        console.error(err);
        res.status(404).send({ error: err.message});
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    if(err.message === "Username already in use"){
        console.error(err);
        res.status(404).send({ error: err.message });
    } else if(err.message === "Email already in use"){
        console.error(err);
        res.status(404).send({ error: err.message });
    } else if(err.message === "Could not create user"){
        console.error(err);
        res.status(500).send({ error: err.message })
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error!' });
})