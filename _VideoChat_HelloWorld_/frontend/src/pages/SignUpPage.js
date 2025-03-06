import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "../Signup.css";
import Navbar from "../components/Navbar";

// SignUpPage: pagina di registrazione. L'utente compila i singoli campi, in caso di valori 
// errati verrà mostrato a video un avviso; altrimenti verrà salvato su DB un nuovo utente.
function SignUpPage () {
  // Funzione di signup
  const { signup } = useAuthStore();

  // Stati per nome, cognome, email e password
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Funzione per la gestione della visibilità della password
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Gestione del focus/blur sugli input
  const handleFocus = (e) => e.target.parentElement.classList.add("active");
  const handleBlur = (e) => {
    if (!e.target.value) {
    e.target.parentElement.classList.remove("active");
    }
  };

  // Funzione per gestire la registrazione
  const handleSignUp = (e) => {
    // Funzione che evita il comportamento di default della pagina
    e.preventDefault();

    // I controlli lato client (es. campo vuoto, lunghezza psw) sono gestiti lato server
    // Invocazione della funzione di signup
    signup({ name, surname, email, password });
  };

  return (
    <div>
      <Navbar />
      <Toaster />
      <img src="../chat.png" id="background-chat" alt="Signup background" />

      {/* Form per la registrazione */}
      <form className="form" onSubmit={handleSignUp}>
        <div className="form-title">
          <h1>Signup</h1>
        </div>

        <div className="form-field">
          
          {/* Campo nome */}
          <div className="form-field-input">
            <label className="Name">Name</label>
            <input 
            id="name"
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            required />
          </div>
        
          {/* Campo cognome */}
          <div className="form-field-input">
            <label className="surname">Surname</label>
            <input 
            id="surname" 
            type="text" 
            value={surname} 
            onChange={(e) => setSurname(e.target.value)} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            required />
          </div>

          {/* Campo email */}
          <div className="form-field-input">
            <label className="email">Email</label>
            <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            required />
          </div>

          {/* Campo password */}
          <div className="form-field-input">
            <label htmlFor="password">Password</label>
            <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required />

              {/* Icona per mostrare/nascondere la password */}
              <ion-icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                className="password-toggle"
                onClick={togglePasswordVisibility}
              ></ion-icon>
          </div>
        </div>

        {/* Per il submit del form */}
        <button type="submit" className="btn-signup">Signup</button>

        {/* Link per la pagina di registrazione */}
        <p className="login-register"> 
          Already have an account? <Link to="/login" className="link link-primary">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
