import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

// Funzione per la registrazione
export const signup = async (req,res) => {
    // Riceviamo le informazioni dal client
    const {name, surname, email, password}= req.body
    try {
        // Validazione dei campi
        if(!name || !surname || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        if (password.length < 8){
            return res.status(400).json({ message: "Password must be at least 8 characters"});
        }

        const user = await User.findOne({email})

        if (user){
            return res.status(400).json({message: "Email already exist"});
        }
        
        // Si cripta la password (bcryptjs)
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt) 

        // Si crea un user (passando la password precedemente criptata)
        const newUser = new User({
            name: name,
            surname: surname,
            email: email,
            password: hashedPassword
        })
 
        // Se è stato creato correttamente
        if(newUser){
            // Genero il token jwt
            generateToken(newUser._id,res);
            await newUser.save(); // salvo l'user nel DB

            // Invio i dati del nuovo utente
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            // Nel caso in cui l'utente non sia stato creato correttaemnte si stampa un messaggio di errore
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        // Nel caso ci sia un errore diverso da qullo di duplicazione nel DB
        if (error.code !== 11000) {
            console.log("Error in signup controller ", error.message);
            res.status(500).json({message: "Internal Server Error"});
        }
    }
};

// Funzione per il login
export const login = async (req,res) => {
    // Ricavo email e password dal body
    const {email, password} = req.body 
    try {
        // Verifico l'esistenza di un utente
        const user = await User.findOne({email})

        // Se non esiste verrà restituito un errore
        if(!user){
            return res.status(400).json({message: "Invalid credential"})
        }
        
        // Verifico se la password è corretta (questo perché prima ho ricercato solo considerando la mail)
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        // Nel caso di password sbagliata si invierà un messaggio di errore
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credential"})
        }

        // In caso di credenziali valide si genera il token
        generateToken(user._id, res)

        // Invio i dati al client
        res.status(200).json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        // Nel caso di errore stampo il messaggio di errore e lo invio al client
        console.log("Error in login controller ", error.message);
        return res.status(500).json({message: "Internal Server Error"})
    }
};

// Funzione per il logout
export const logout = (req,res) => {
    try {
        // Associando al cookie una stringa vuota lo stiamo "pulendo" e aggiorno la scadenza a 0
        res.cookie("jwt","", {maxAge:0})
        // Invio il messaggio al client
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        // Nel caso di errore stampo il messaggio di errore e lo invio al client
        console.log("Error in logout controller", error.message);
        return res.status(500).json({message: "Internal Server Error"})
    }
};

// Funzione per verificare se l'utente è autenticato
export const checkAuth = (req,res) => {
    try {
        // Se l'autenticazione è riuscita, invia i dati al client
        res.status(200).json(req.user); 
    } catch (error) {
        // Nel caso di errore stampo il messaggio di errore e lo invio al client        
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}