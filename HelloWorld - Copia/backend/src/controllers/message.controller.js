import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import {getReceiverSocketId} from "../lib/socket.js"
import {io} from "../lib/socket.js"

// Funzione che restituisce tutti gli utenti eccetto che noi stessi
export const getUsersForSidebar = async (req, res) => {
    try {
        // Salvo l'id dell'utente che è loggato
        const loggedInUserId = req.user._id; 

        // Ricerco tutti gli utenti eccetto quello loggato e
        //  salvo le informazioni eccetto la password in modo 
        // da non restituire questa all'utente
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password") 

        // Invio le informzioni
        res.status(200).json(filteredUsers)
    } catch (error) {
        // Inc aso di errore stampo un messaggio
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

// Funzione per restituire i messaggi presenti in una chat
export const getMessages = async (req, res) => {
    try {
        // Estraggo id dalla richiesta e lo ridenomino userToChatId
        const {id:userToChatId} = req.params 

        // Ricavo il mio ID a partire dai parametri di richiesta
        const myId = req.user._id 
        
        // Ricerco i messaggi in cui mittente/destinatario sono io o l'altro utente
        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        }) 

        // Invio i dati
        res.status(200).json(messages)
    } catch (error) {
        // Nel caso di errore stampo il messaggio
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

// Funzione per la creazione di un messaggio (il messaggio può essere testo o un immagine)
export const sendMessage = async (req, res) => {
    try {
        // Si utilizza let in quanto il contenuto del messaggio sarà cambiato se vuoto
        let {text, image} = req.body;
        const senderId = req.user._id; // salvo l'ID del mittente
        
        const {id:receiverId} = req.params; // rinomino id con receiverId

        // Se non è presente un immagine aggiorno il contenuto con una stringa vuota
        if(!image){
            image = ""
        }

        // Creazione del nuovo messaggio con i parametri precedentemente ricavati
        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            text: text,
            image: image
        });

        // Salvo il messaggio nel DB
        await newMessage.save();
        
        // Invio real-time - socket.io
        // Recupero l'ID del socket dell'utente destinatario
        const receiverSocketId = getReceiverSocketId(receiverId);

        // Se esiste (l'utente è online) invio il messaggio in real-time
        if (receiverSocketId) { 
            // Essendo una private chat utilizzo to() per inviare il messaggio 
            // solo al receiver specificato (e non a tutti - non è una group chat)
            io.to(receiverSocketId).emit("newMessage", newMessage); 
        }

        // Messaggio creato (201)
        res.status(201).json(newMessage)

    } catch (error) {
        // Nel caso di errori si stampa un messaggio
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};