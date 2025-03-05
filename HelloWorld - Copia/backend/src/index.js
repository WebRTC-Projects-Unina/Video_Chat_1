import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js"
import cors from 'cors'
import {app, server} from "./lib/socket.js"

import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"

dotenv.config() // per il caricamento delle variabili d'ambiente presenti in .env
const PORT = process.env.PORT

app.use(express.json({ limit: "50mb" }));  // Aumenta il limite di file JSON da aceettare (50MB)
app.use(express.urlencoded({ extended: true, limit: "50mb" }));  // Permette di accettare dati da form HTML (fino a 50 MB)
app.use(cookieParser()) // serve per la gestione dei cookie
app.use(cors({ // per accettare le richieste dal client react
    origin: "http://localhost:3000", 
    credentials: true // per il salvataggio dei cookies
}))

// Rotte principali
app.use("/auth", authRoutes) // per utenti
app.use("/messages", messageRoutes) // per i messaggi 

// Server in ascolto al port number 5000
server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB(); // connessione al DB
})