import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Creo un nuovo server 
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"] // per accettare dati dal client (React)
    }
});

// Definisco un dizionario per associare gli userId ai
// rispettivi socketId (per tenere traccia degli utenti online)
const userSocketMap = {};

// Funzione per ottenere il socketId di uno specifico userId
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Se un utente si collega al server
io.on("connection", (socket) => {
    // Si ottiene l'userId dalla query string
    const userId = socket.handshake.query.userId;
    
    // Se non vuoto, associo l'userId al socketId
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Ogni volta che un utente si connette, invio (a tutti )
    // la lista aggiornata degli utenti online
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Per gestire le chiamata in arrivo
    socket.on("callUser", ({ userToCall, signalData, from }) => {
        // RIcavo il socketId (destinatario)
        const socketId = userSocketMap[userToCall];

        // Se offline
        if (!socketId) {
            return;
        }

        // Se online, invio un evento al destinatario  passando i dati della chiamata
        io.to(socketId).emit("callIncoming", { from, signal: signalData });
    });

    // Per rispondere ad una chiamata
    socket.on("answerCall", ({ to, signal }) => {
        // Recupero il socketId
        const socketId = userSocketMap[to];

        // Se offline
        if (!socketId) {
            return;
        }

        // Se online, invia al chiamante (to) il messaggio di chiamata accettata
        io.to(socketId).emit("callAccepted", signal);
    });

    // Disconnessione
    socket.on("disconnect", () => {
        if (userId) {
            // Rimuovo l'utente dalla lista e invio la lista aggiornata degli utenti online
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };
