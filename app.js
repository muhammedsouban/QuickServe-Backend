import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import adminRoute from './routes/adminRoute.js';
import userRoute from './routes/userRoute.js';
import providerRoute from './routes/providerRoute.js';
import { connectToMongoDB } from './config/db.js';
import initializeSocket from './config/socket.js';

dotenv.config();

const { PORT,ORIGIN } = process.env;

const app = express();

app.use(express.json());
app.use(cors({
  origin: ORIGIN,
  credentials: true
}));
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public/images', express.static('public/images'));

app.get('/', (req, res) => {
  res.status(201).json('Home GET Request');
});

app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/provider', providerRoute);

connectToMongoDB()
const server = app.listen(PORT, () => {
  console.log(`Server connected to http://localhost:${PORT}`);
});
initializeSocket(server)