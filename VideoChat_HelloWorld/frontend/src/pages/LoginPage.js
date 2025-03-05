import React, { useState } from "react";
import "../Login.css";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

// LoginPage: pagina di login. L'utente dopo essersi registrato inserisce le proprie 
// credenziali. Il sistema verifica la loro correttezza. Infine l'utente potrà scambiare
// messaggi con altri utenti ed effettuare videochiamate.
function LoginPage () {
    // Funzione di login
    const { login } = useAuthStore();

    // Stati per email e password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Funzione che gestisce il cambio di stato degli input (email e password)
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    // Funzione per la gestione della visibilità della password
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    // Gestione del focus/blur sugli input
    const handleFocus = (e) => e.target.parentElement.classList.add("active");
    const handleBlur = (e) => {
        if (!e.target.value) {
        e.target.parentElement.classList.remove("active");
        }
    };

    // Funzione per gestire il login
    const handleLogin = (e) => {
        e.preventDefault(); // Si evita il comportamento di default della pagina

        // I controlli (es. campo vuoto, lunghezza psw) sono fatti lato server 

        // Chiamata alla funzione di login
        login({ email, password });
    };

    return (
        <div>
            <Navbar />
            <Toaster /> {/* Per gestire i messaggi di notifica */}
            
            {/* Immagine di sfondo */}
            <img src="../chat.png" id="background-chat" alt="Login background" />

            {/* Form per il login */}
            <form className="form" onSubmit={handleLogin}>
                {/* Titolo */}
                <div className="form-title">
                    <h1>Login</h1>
                </div>

                <div className="form-field">
                    {/* Campo Email */}
                    <div className="form-field-input">
                        <input
                        id="user"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required/>
                        <label htmlFor="user">Username</label>
                        <ion-icon name="person-outline" className="username"></ion-icon>
                    </div>

                    {/* Campo Password */}
                    <div className="form-field-input">
                        <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required/>
                        <label htmlFor="password">Password</label>

                        {/* Icona per mostrare/nascondere la password */}
                        <ion-icon
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        ></ion-icon>
                    </div>

                {/* Ricorda password - password dimenticata */}
                <div className="form-field-remember-forgot">
                    <label><input type="checkbox" /> Remember me </label>
                    <a href="#">Forgot password?</a>
                </div>

                {/* Bottone per il submit del form */}
                <button type="submit" className="login-btn"> Login </button>

                {/* Link verso la pagina di registrazione */}
                <div className="login-register">
                    <p> Don't have an account?{" "}
                        <Link to="/signup" className="secondary-btn">Register</Link>
                    </p>
                </div>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
