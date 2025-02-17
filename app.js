import express from 'express';
import cors from 'cors';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
const MySQLStore = await import('express-mysql-session').then(module => module.default(session));
import { addEventParticipant, getEvents, getTags, getUserEvents, postEvent } from './controllers/eventcontrollers.js';
import { getUser, loginUser, postUser } from './controllers/usercontrollers.js';
import { patchUser } from './models/usermodels.js';
import 'dotenv/config';

export const app = express();
export const port = process.env.PORT || 3000;

//Middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());

const options = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_SESSION_DB
};

export const sessionStore = new MySQLStore(options);

app.use(session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
     } //Set to true when using HTTPS
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try{
            const uploadDir = path.join(__dirname, 'uploads');
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch(err) {
            console.error(err);
            cb(err);
        }
    },
    filename: async (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + suffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
        res.send(response); 
    } catch(err){
        next(err);
    };
});

app.post('/events/participants', async (req, res, next) => {
    try {
        const response = await addEventParticipant(req.query.id, req.query.email);
        res.status(200).send(response);
    } catch(err) {
        next(err);
    };
});

app.get('/users/events', async (req, res, next) => {
    try{
        const response = await getUserEvents(req.query.email);
        res.send(response);
    } catch (err) {
        next(err);
    };
});

app.post('/events', isAdmin, upload.single('image'), async (req, res, next) => {
    if(!req.file) {
        return res.status(400).send('No file attached');
    }
    try {
        const relativePath = path.relative(__dirname, req.file.path);
        const response = await postEvent(req.body, relativePath);
        res.send(response);
    } catch(err) {
        next(err);
    }
})

app.get('/events/images', async(req, res, next) => {
    const options = {
        root: path.join(__dirname)
    };
    try{
        const path = req.query.path;
        res.sendFile(path, options);
    } catch(err) {
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
    if(err.code === "ER_DATA_TOO_LONG"){
        console.error(err)
        res.status(503).send({ error: err.sqlMessage});
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