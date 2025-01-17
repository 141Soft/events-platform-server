import express from 'express';
import cors from 'cors';

export const app = express();
export const port = process.env.PORT || 3000;


//Middleware
app.use(cors());


//Routes
app.get('/', (req, res) => {
    res.send({ msg: 'Success'})
});

//Error Handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Error!' })
})