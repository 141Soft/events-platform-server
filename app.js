import express from 'express';
import cors from 'cors';
import session from 'express-session';
const MySQLStore = await import('express-mysql-session').then(module => module.default(session));
import { getEvents, getTags, postEvent } from './controllers/eventcontrollers.js';
import { getUser, loginUser, postUser } from './controllers/usercontrollers.js';
import { patchUser } from './models/usermodels.js';

export const app = express();
export const port = process.env.PORT || 3000;

//Middleware
app.use(cors({
    origin:'http://localhost:5173'
}));

app.use(express.json());

const options = {
    host: 'localhost',
    port: 3306,
    user: 'test',
    password: 'secret',
    database: 'session_test'
};

const sessionStore = new MySQLStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } //Set to true when using HTTPS
}))

const isAuthenticated = (req, res, next) => {
    if(req.session.user) {
        next();
    } else {
        res.status(401).send({ error: 'Authentication required'});
    }
}

const isAdmin = (req, res, next) => {
    if(req.session?.user?.admin === 1){
        next();
    } else {
        res.status(403).send({ error: 'Access Denied'});
    }
}


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

app.post('/users/login', async (req, res, next) => {
    try {
        const response = await loginUser(req.body);
        await new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if(err){ return reject(err) };
                req.session.user = {
                    username: response.user.userName,
                    admin: response.user.isAdmin,
                };
                resolve();
            })
        })
        res.send(response);
    } catch(err) {
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

app.patch('/users/update', isAdmin, async (req, res, next) => {
    try {
        const response = await patchUser(req.query);
        console.log(response);
        res.send(response); 
    } catch(err){
        next(err);
    }
})

//Test routes
app.get('/secure-route', isAuthenticated, (req, res) => {
    res.send({ message: 'Secure route successful!' });
});

app.get('/admin-route', isAdmin, (req, res) => {
    res.send({ message: 'Admin route successful! '});
});

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
    if(err.message === "Invalid credentials"){
        console.error(err);
        res.status(404).send({ error:err.message })
    } else {
        next(err);
    }
})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error!' });
})