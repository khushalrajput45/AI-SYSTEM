import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ [MongoDB Direct Connection Failed]: ${error.message}`);
    console.log(`ℹ️ Attempting in-memory database fallback for frictionless standalone demo...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const memoryConn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`🚀 [In-Memory MongoDB Started]: ${memoryConn.connection.host}`);
    } catch (memErr) {
      console.error(`❌ [MongoDB Error]: Could not establish MongoDB or In-Memory connection: ${memErr.message}`);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ [MongoDB Disconnected]');
});
