import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

// Creazione di un router per gestire le rotte
const router = express.Router();

// I metodi GET restituiscono gli utenti e i messaggi (a partire da un certo id)
// Utilizzo nuovamente protectRoute per verificare se l'utente sia autenticato 
// e successivamente utilizzo:
// - getUsersForSidebar: per visualizzare gli user nella sidebar
// - getMessages: per visualizzare i messaggi relativi ad uno specifico user
router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)

// Metodo POST: per l'invio di un messaggio ad un utente con uno specifico ID
router.post("/send/:id", protectRoute, sendMessage)

export default router;