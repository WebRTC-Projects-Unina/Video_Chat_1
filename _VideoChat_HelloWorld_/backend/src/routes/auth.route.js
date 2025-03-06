import express from "express"
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

// Creazione di un router per gestire le rotte
const router = express.Router()

// Si utilizzano dei metodi POST, in quanto si inviano dei dati
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

// Si utilizza un metodo GET per verificare se l'utente ha il token
// - protectRoute si utilizza per verificare se l'utente è loggato
// - checkAuth viene invocata ad ogni refresh della pagina e 
//   verifico se l'utente è autenticato
router.get("/check", protectRoute, checkAuth) 

export default router;