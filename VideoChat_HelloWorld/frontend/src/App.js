import React, { useEffect } from 'react'
import {Routes, Route, Navigate} from "react-router-dom"
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import './App.css';

import { useAuthStore } from './store/useAuthStore'

function App () {
  
  // Si richiamano gli elementi definiti in useAuthStore
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()
  
  // Non appena viene avviata l'applicazione si verifica se l'autore è "checkato"
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Se abbiamo verificato e non c'è nessun User, mostra il loader (caricamento)
  if(isCheckingAuth && !authUser) return (
    <div className='div-loader'>
      <div className='loader'></div> 
    </div>
  )

  return (
    <div>
      <Routes>
        {/* Se non c'è un utente (non autenticato) questo verrà reindirizzato 
        verso la pagina di login -> non vedrò la pagina di home */}
        <Route path='/' element={authUser ? <HomePage/>: <Navigate to="/login"/>}/>
        {/* Se l'utente è loggato deve poter vedere la pagina di signup o login, 
        altrimenti va nella pagina di home */}
        <Route path='/signup' element={!authUser ? <SignUpPage/>: <Navigate to="/"/>}/>
        <Route path='/login' element={!authUser ? <LoginPage/>: <Navigate to="/"/>}/>
      </Routes>
    </div>
  )
}

export default App;