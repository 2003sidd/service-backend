
import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const connectDb = async () => {
    try {


        // Set up MongoDB connection
        mongoose.connect("mongodb+srv://siddhantbarman:Sidd%40123@cluster0.kfgyd41.mongodb.net/ServiceSite?retryWrites=true&w=majority&appName=Cluster0")

        // Get the default connection
        // Mongoose maintains a default connection object representing the MongoDB connection.
        const db = mongoose.connection;

        // Define event listeners for database connection

        db.on('connected', () => {
            console.log('Connected to MongoDB server');
        });

        db.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        db.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
    } catch (error) {
     console.log("Error is",error)   
    }
}
// Define the MongoDB connection URL


// Export the database connection
export default connectDb;
