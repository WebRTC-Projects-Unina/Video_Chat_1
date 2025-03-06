import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from "../lib/utils";
import VideoCall from "./VideoCall.js";

function ChatContainer () {
    // Richiamo degli elementi e funzioni definite in ChatStore
    const { 
        messages, 
        getMessages, 
        selectedUser, 
        subscribeToMessages, 
        unsubscribeFromMessages,
        isVideoCallOpen,
        setIsVideoCallOpen,
        setStream,
        setPeerStream
    } = useChatStore();

    // Richiamo authUser da AuthStore
    const { authUser } = useAuthStore();

    // Riferimento per il socket
    const socketRef = useRef(null);
    
    // Per aggiornare successivamente la posizione della schermata in basso all'arrivo di messaggi
    const messageEndRef = useRef(null);

    useEffect(() => {
        // Si considerano solo i messaggi tra l'utente loggato e l'utente selezionato
        getMessages(selectedUser._id);
        subscribeToMessages(); // per la gestione di messaggi real-time

        // Nel caso di chiusura della pagina o logout si invoca la funzione
        return () => unsubscribeFromMessages(); 
    }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        // Imposto la posizione verso il basso all'arrivo del messaggio
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behaviour: "smooth" }); 
        }
    }, [messages]);

    return (
        <div className='content'>
            {/* HEADER DELLA CHAT */}
            <ChatHeader />
            {/* Bottone per avviare la videochiamata */}
            <button onClick={() => setIsVideoCallOpen(true)}
                className="videocall-btn">
                <ion-icon name="videocam-outline"></ion-icon>
            </button>

            {/* Nel caso in cui il bottone sia premuto, si effettua la videochiamata */}
            {/* Si passa l'ID dell'utente da chiamare e il chiamante, le modalità con cui*/}
            {/* chiudere la chiamata e funzioni per "settare" stream e peer */}
            {isVideoCallOpen && (
                <VideoCall 
                    userToCall={selectedUser._id}
                    authUser={authUser} 
                    setStream={setStream} 
                    setPeerStream={setPeerStream}
                />
            )}

            {/* MESSAGGI */}
            <div className="messages">
                <ul>
                    {messages.map((message) => (
                        // Stampo la lista di messaggi
                        <li
                            key={message._id}
                            // Si associa un className diverso se il messaggio è stato inviato o ricevuto
                            className={
                                `chat ${message.senderId === authUser._id ? "replies" : "sent"}
                                `}
                            ref={messageEndRef}
                        >
                            {/* Immagine del mittente */}
                            <img
                                // Se non esiste l'immagine verrà associata ./avatar.png
                                src={message.senderId === authUser._id
                                    ? authUser.profilePic || "/avatar.png"
                                    : selectedUser.profilePic || "/avatar.png"
                                }
                                alt="User Profile"
                            />
                            
                            <div className="message-container">

                                {/* Messaggio: immagine */}
                                {message.image && (
                                    <img className="image-sent" src={message.image} alt="img message" />
                                )}

                                {/* Messaggio: testo */}
                                {message.text && <p>{message.text}</p>}

                                {/* Data del messaggio */}
                                <time className="time">{formatMessageTime(message.createdAt)}</time>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Per scrivere il messaggio */}
            <MessageInput />
        </div>
    );
}

export default ChatContainer;
