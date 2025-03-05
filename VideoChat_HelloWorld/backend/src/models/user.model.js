import mongoose from "mongoose";

// UTENTE:
// - email: string
// - name: string
// - surname: string
// - password: string
// - profilePic: string

// Creazione dello schema
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        surname: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profilePic: {
            type: String,
            default: "", // può essere vuota se non aggiornata

        },
    }, {timestamps: true}
);

// Creazione del modello
const User = mongoose.model("User", userSchema);

export default User;