import mongoose from "mongoose";

let isConnected = false;

export default async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/college-clubs";

  await mongoose.connect(mongoUri);
  isConnected = true;
  return mongoose.connection;
}
