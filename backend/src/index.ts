import express from 'express';
import { createServer} from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import authRoutes from './routes/auth'
import statsRoutes from './routes/stats'
dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors:{
        origin : process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (_req, res)=>{
    res.json({ status: 'ok', timestamp: new Date().toISOString()});
});

app.use('/api/auth',authRoutes);
app.use('/api/stats', statsRoutes);


const PORT = parseInt(process.env.PORT || '4000', 10);

async function start(){
    await connectDB();
    httpServer.listen(PORT,()=>{
        console.log(`Backend Server is Up and running on PORT ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('MongoDB: connected');
    })
}

start().catch(console.error);
