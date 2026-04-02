import mongoose from "mongoose";

export async function connectDB(): Promise<void>{
    const uri = process.env.MONGODB_URI!;
    try {
        await mongoose.connect(uri,{
            serverSelectionTimeoutMS:5000,
        });
        console.log('Mongo DB Connected:', mongoose.connection.host);
    } catch (error) {
        console.error('MongoDB Connection error:', error);
        process.exit(1);
    }

    mongoose.connection.on('error',(err)=>{
        console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () =>{
        console.warn('mongoDB disconnected. Reconnecting...')
    });
}