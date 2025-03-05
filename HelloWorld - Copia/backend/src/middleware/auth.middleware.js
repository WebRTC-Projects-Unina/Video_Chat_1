import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

// Funzione per verificare se l'utente è autenticato
export const protectRoute = async (req, res, next) => {
    try {
        // Come prima cosa si verifica la presenza o meno del token nei cookie
        const token = req.cookies.jwt 
        
        // In assenza di token si restituirà un errore
        if(!token){
            return res.status(401).json({message: "Unauthorized - No token Provided"})
        }

        // In caso di token, si procede con la decodifica per avere informazioni
        //  sui dati presenti nel payload (userId)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Se non è possibile fare la decodifica, allora il token è invalido
        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid Token"})
        }

        // Superati i check, posso ricercare l'utente nel DB. Ricerco ques'ultimo 
        // per decoded.userId (non passo la password)
        const user = await User.findById(decoded.userId).select("-password")

        // Se non è stato trovato nessun utente, si invia un errore (404 - not found)
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }

        // Superati questi controlli, l'user è autenticato. Aggiorno la richiesta
        req.user = user

        // Se l'utente è autenticato invoco invoco la funzione successiva
        next()
    } catch (error) {
        // Nel caso di errore stampo l'errore
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({message: "Interval server error"})        
    }
}