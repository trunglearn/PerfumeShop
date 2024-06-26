/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './app/routers';

dotenv.config();

const { PORT } = process.env;

const app = express();

app.use(
    cors({
        credentials: true,
    })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.resolve('./public')));
app.use('/public', express.static(path.resolve('./public')));

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running http://localhost:${PORT}/`);
});

app.use('/', router());
