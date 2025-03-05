import mongoose from "mongoose"

// MESSAGGIO
// - senderId: Utente
// - receiverId: Utente
// - text: string
// - image: string

// Creazione dello schema
const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // testo e immagine non sono obbligatori (potrei avere testo senza immagine
        //  o viceversa ma anche entrambi)
        text: {
            type: String,
        },
        image: {
            type: String,
        },
    },
    {timestamps: true} // per la gestione dell'ora/data del messaggio
);

// Creazione del modello
const Message = mongoose.model("Message", messageSchema);

export default Message;