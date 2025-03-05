import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { formatMessageTime } from "../lib/utils";

// Sidebar: componente che contiene le informazioni su tutti gli utenti e salva l'ultimo messaggio e il suo orario
function  Sidebar () {
    // Si recupera da chatStore elementi/funzioni utili successivamente
    const { getUsers, users, setSelectedUser, getMessages, lastMessages } = useChatStore();

    useEffect(() => {
        // Si restituiscono gli utenti una sola volta
        getUsers();
    }, [getUsers]);

    useEffect(() => {
        // Una volta caricati gli utenti, chiamiamo getMessages per ciascun utente
        if (users.length > 0) {
            users.forEach((user) => getMessages(user._id));
        }
    }, [users]); // Si attiva quando "users" cambia

    return (
        <div id="sidepanel">
            {/* titolo */}
            <div id="title-chat">
                <div className="wrap">
                    <h1>Chat</h1>
                </div>
            </div>

            <div id="contacts">
                <div className="wrap">
                    {/* Utenti da stampare a video */}
                    {users.map((user) => {
                        // Si verifica se ci sono dati relativi all'ultimo messaggio
                        // Nel caso il valore fosse vuoto vorrà dire che si tratta di una nuova chat
                        const lastMessageData = lastMessages?.[user._id];
                        
                        let lastMessage = "Nessun messaggio";
                        if (lastMessageData) {
                            // Se c'è un testo
                            if (lastMessageData.text && lastMessageData.text.trim() !== "") {
                                // Ma anche immagine, concateno 📷 e il testo
                                if (lastMessageData.image) {
                                    lastMessage = `📷 ${lastMessageData.text}`;
                                // Altrimenti stampo solo il testo
                                } else {
                                    lastMessage = lastMessageData.text;
                                }
                            }
                            
                            // Se c'è solo un'immagine, mostro 📷 Foto
                            else if (lastMessageData.image) {
                                lastMessage = "📷 Foto";
                            }
                        }
                        // Salvo l'orario di invio del messaggio, se non c'è nessun messaggio sarà vuoto
                        const lastTime = lastMessageData?.createdAt ? formatMessageTime(lastMessageData.createdAt) : "";
                        
                        return (
                            // UTENTE
                            // Ogni singolo utente è rappresentato da un bottone
                            <button className="user-btn" key={user._id} onClick={() => setSelectedUser(user)}>
                                {/* Immagine dell'utente */}
                                {/* In caso non sia presente viene mostrato l'avatar */}
                                <img className="user-img" src={user.profilePic || "/avatar.png"} />
                                <div className="block">
                                    <div className="row">
                                        {/* Nome e cognome */}
                                        <p className="name">{user.name} {user.surname}</p>
                                        {/* Orario di invio dell'ultimo messaggio */}
                                        <p className="time">{lastTime}</p>
                                    </div>
                                    <div className="row">
                                        {/* Ultimo messaggio */}
                                        <p className="preview">{lastMessage}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
