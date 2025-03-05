import mongoose from "mongoose"

// Funzione per la connessione al DB (MongoDB)
export const connectDB = async () => {
    try {
        // Connessione all'indirizzo definito nel file .env
        const conn = await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log('MongoDB connection error: ' + error)
    }
}