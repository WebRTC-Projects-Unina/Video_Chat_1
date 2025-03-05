import React from 'react'
import Navbar from '../components/Navbar'

// NoChatSelected: nel caso in cui l'utente non abbia selezionato alcuna
// chat comparirà una schermata con il logo dell'app e un messaggio
function NoChatSelected () {
  return (
    <div className="content">
      {/* Per la visualizzazione del bottone di logout */}
      <Navbar />
      <div className='content-text'>
        {/* Logo */}
        <img src='/image.png'/>
        {/* Testo iniziale */}
        <h1>Hello World!</h1>
        <p>Seleziona una chat :)</p>
        <br></br>
        <div className='warning'>
          <p>⚠️ Si sconsiglia l'utilizzo dell'app alla guida</p>
          <i><p> (riferimenti puramente casuali)</p></i>
        </div>
      </div>
 	</div>
  );
};

export default NoChatSelected;