import jwt from "jsonwebtoken"

// Funzione per la generazione del token JWT (associato ad un utente). Esso sarà poi salvato nel cookie
export const generateToken = (userId, res) => {
    // creazione del token
    const token = jwt.sign(
        {userId}, // contenuto del payload
        process.env.JWT_SECRET, // chiave segreta usata per firmare il token
        {expiresIn: "7d"} // scadenza: 7 giorni
    )

    // Si invia nel cookie
    res.cookie("jwt",token,{
        maxAge: 7 * 24 * 60* 60 * 1000, // tempo massimo in millisecondi (7 giorni)
        httpOnly: true, // cookie accessibile tramite HTTP
        sameSite: "strict", // il cookie è usato solo per richieste dello stesso sito
    })

    return token;
}