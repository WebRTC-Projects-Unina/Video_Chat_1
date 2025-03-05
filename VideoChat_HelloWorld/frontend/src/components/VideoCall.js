import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { Toaster, toast } from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

function  VideoCall ({ userToCall, authUser }) {
  // Stati e riferimenti utili per le funzioni successive
  const socketRef = useRef(null); // Riferimento per il socket
  const [stream, setStream] = useState(null); // Stato per lo stream video/audio dell'utente
  const [callAccepted, setCallAccepted] = useState(false); // Stato per tracciare se la chiamata è stata accettata
  const [callIncoming, setCallIncoming] = useState(null); // Stato per gestire una chiamata in arrivo
  const [incomingCallVisible, setIncomingCallVisible] = useState(true); // Stato per mostrare/nascondere la interfaccia di chiamata in arrivo
  const [isMuted, setIsMuted] = useState(false); // Stato per attivare/disattivare il microfono
  const [isVideoOff, setIsVideoOff] = useState(false); // Stato per attivare/disattivare la webcam

  // Riferimenti ai video locali e remoti
  const myVideo = useRef();
  const userVideo = useRef();

  // Riferimento per la connessione WebRTC
  const connectionRef = useRef();

  const {setIsVideoCallOpen} = useChatStore() // Richiamo dal chatStore la funzione

  useEffect(() => {
    if (!socketRef.current) {
      try {
        // Socket
        socketRef.current = io("http://localhost:5000", { query: { userId: authUser._id } });
  
        // In ascolto di una chiamata in arrivo
        socketRef.current.on("callIncoming", (data) => {
          // Aggiorno lo stato: 
          // - La chiamata è ricevuta (-> true), aggiorno mittente e segnale
          setCallIncoming({ isReceivingCall: true, from: data.from, signal: data.signal });
        });
  
        // Si richiedono i permessi (camera e microfono)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
            // Nel caso di permessi concessi aggiorno lo stato
            setStream(currentStream);
            if (myVideo.current) myVideo.current.srcObject = currentStream;
          })
          .catch((err) => {
            toast.error("Permissions denied");
          });
      } catch (error) {
        toast.error("Server error");
      }
    }
  }, [authUser]);
  

  // Funzione per iniziare una chiamata
  const initiateCall = () => {
    // Creazione del Peer. E' stato utilizzato Peer e non RTCPeerConnection, in quanto questo
    // permette di gestire in modo più semplice ICE, SDP e segnalazione
    const peer = new Peer({ 
      initiator: true, // l'utente è inizializzatore della chiamata
      trickle: false, // tutti i candidate ICE sono inviati in un unico messaggio (Trickle ICE disabilitato)
      stream // flusso audio/video per la trasmissione
    });

    // Segnalazione
    peer.on("signal", (data) => {
      // Si invia il un messaggio passando destinatario, dati e mittente
      socketRef.current.emit("callUser", { userToCall, signalData: data, from: authUser._id });
    });

    // Per la gestione del flusso audio/video
    peer.on("stream", (userStream) => {
      // Si aggiorna il flusso (remoto)
      userVideo.current.srcObject = userStream;
    });

    // Nel caso di chiamata accettata si invia un segnale all'altro utente e si aggiorna lo stato
    socketRef.current.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    // Aggiorna il riferimento e invia una notifica
    connectionRef.current = peer;
    toast.success('Request sent...')
  };

  // Si invoca in caso di chiusura della chiamata
  const closeCall = () => {
    // Imposto lo stato a false
    setIsVideoCallOpen(false)

    // Interrompo i flussi video dell'utente locale
    if (myVideo.current) {
      // Si ricavano le tracce e che vengono fermate
      const tracks = myVideo.current.srcObject?.getTracks();
      tracks?.forEach(track => track.stop());
    }

    // Procedo nello stesso modo per l'utente remoto
    if (userVideo.current) {
      const tracks = userVideo.current.srcObject?.getTracks();
      tracks?.forEach(track => track.stop());
    }

    // Aggiorno lo stato: la chiamata non è più accettata
    setCallAccepted(false);

    // Resetto lo stato per la chiamata in arrivo
    setCallIncoming(null);
    
    // Nascondo l'interfaccia della chiamata in arrivo
    setIncomingCallVisible(false);
    
    // Nascondo il video locale
    setIsVideoOff(true);
  };

  // Funzione per rispondere alla chiamata
  const answerCall = () => {
    if (callIncoming) {
      // Aggiorna gli stati
      setCallAccepted(true);
      setIncomingCallVisible(false);

      // Creazione del peer
      const peer = new Peer({ 
        initiator: false, // ricevente
        trickle: false, // tutti i candidate ICE sono inviati in un unico messaggio (Trickle ICE disabilitato)
        stream // flusso
      });

      // Invia segnale la risposta alla chiamata
      peer.on("signal", (data) => {
        socketRef.current.emit("answerCall", { to: callIncoming.from, signal: data });
      });

      // Gestisce il flusso audio/video
      peer.on("stream", (userStream) => {
        // Si aggiorna il flusso (remoto)
        userVideo.current.srcObject = userStream;
      });

      // Invio il segnale
      peer.signal(callIncoming.signal);

      // Salvo il riferimento alla connessione
      connectionRef.current = peer;
    }
  };

  // Funzione per attivare/disattivare il microfono
  const toggleMute = () => {
    if (stream) {
      // Si ricavano le tracce, con enable verifico se la traccia è atitva o meno
      // imposto come isMuted
      stream.getAudioTracks().forEach(track => track.enabled = isMuted);
      // imposto lo stato opposto (se non mutata -> la muto e vic.)
      setIsMuted(!isMuted);
    }
  };

  // Funzione per attivare/disattivare la camera (procedo nello stesso modo)
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    // Dopo che entrambi gli utenti hanno premuto il bottone di videochiamata, il primo utente
    // potrà inviare una richiesta al secondo utente che potrà accettare la videochiamata.
    // Una volta accettata, potranno comunicare scambiando audio e video.
    <div>
      {/* Video dell'utente locale */}
      <video playsInline muted ref={myVideo} autoPlay className="my-video" style={{ bottom: -225 }} />
      {/* Video utente remoto (mostrato solo se la chiamata è accettata) */}
      {callAccepted && <video playsInline ref={userVideo} autoPlay className="user-video" />}
      
      {/* Opzioni chiamata */}
      <div className="option-bar" style={{ bottom: 100 }}>
        {/* Mostra il bottone di chiamata solo se questa non è stata ancora accettata */}
        {!callAccepted && (
          <button
            className="btn-videocall" 
            onClick={initiateCall}>
            <ion-icon name="call-outline"></ion-icon>
          </button>
        )}
        {/* Bottone per attivare/disattivare la camera */}
        {isVideoOff ? (
          <button 
            className="btn-videocall"
            onClick={toggleVideo}>
            <ion-icon name="videocam-off-outline"></ion-icon>
          </button>
        ) : (
          <button 
            className="btn-videocall" 
            onClick={toggleVideo}>
            <ion-icon name="videocam-outline"></ion-icon>
          </button>
        )}

        {/* Bottone per attivare/disattivare il microfono */}
        {isMuted ? (
          <button 
            className="btn-videocall" 
            onClick={toggleMute}>
            <ion-icon name="mic-off-outline"></ion-icon>
          </button>
        ) : (
          <button 
            className="btn-videocall" 
            onClick={toggleMute}>
            <ion-icon name="mic-outline"></ion-icon>
          </button>
        )}

        {/* Bottone per chiudere la chiamata */}
        <button 
          className="btn-close" 
          onClick={closeCall}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      {/* Se la chiamata è in arrivo, si mostra un messaggio e un bottone per accettare tale chiamata */}
      {incomingCallVisible && callIncoming?.isReceivingCall && (
        <div>
          <h3 className="call-incoming" style={{ top: 100 }}>Call incoming...</h3>
          <button className="btn-accept" style={{ top: 150 }} onClick={answerCall}>Accept</button>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default VideoCall;
