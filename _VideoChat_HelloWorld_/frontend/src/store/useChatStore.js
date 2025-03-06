import {create} from "zustand"
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

// E' stata utilizzata la libreria zustand per salvare in unico punto utenti e messaggi al
// fine di recuperare più facilmente il contentuo; zustand mi permette di gestire in modo
// più semplice lo stato. Una possibile alternativa sarebbe stata invocare le stesse
// funzioni più volte nelle singole componenti React e gestire lo stato utilizzando useState()

// Gestisce le funzioni legate ai messaggi e si occupa della comunicazione verso il server
export const useChatStore = create((set, get) => ({
    messages: [],       // per salvare i messaggi
    users: [],          // per salvare gli utenti
    selectedUser: null, // inizialmente non selezioneremo nessun utente
    lastMessages: {},   // per tenere traccia dell'ultimo messaggio
    
    // Nuovi stati per la gestione delle videochiamate
    isVideoCallOpen: false,
    peerStream: null,
    stream: null,
    
    // Funzione che restituisce gli utenti
    getUsers: async () => {
        try {
            // invocazione del metodo
            const res = await axiosInstance.get("/messages/users")
            set({users: res.data}); // imposto gli utenti (sulla base di quelli ricevuti)
        } catch (error) {
            // Nel caso di errore, stampo un messaggio
            toast.error(error.response.data.messagge)
        }
    },

    // Procedo nello stesso modo per i messaggi. Stavolta però sarà necessario 
    // passare l'ID dell'utente per identificare la specifica chat 
    getMessages: async (userId) => {
        try {
            // invocazione del metodo
            const res = await axiosInstance.get(`/messages/${userId}`)
            // imposto gli utenti (sulla base di quelli ricevuti) e aggiorno l'ultimo messaggio
            set((state) => ({
                messages: res.data,
                lastMessages: {
                    // per i messaggi precedenti
                    ...state.lastMessages, 
                    // Se ci sono messaggi, prendo l'ultimo messaggio ricevuto;
                    // altrimenti, imposto il valore a null.
                    [userId]: res.data.length > 0 ? res.data[res.data.length - 1] : null,
                }
            }));
        } catch (error) {
            // Nel caso di errore stampo il messaggio
            console.log(error.response.data.messagge)
        } 
    },
    
    // Funzione invocata per l'invio dei messaggi
    sendMessage : async (messageData) => {
        // Recupero con il metodo get l'utente selezionato, i messaggi e l'ultimo messaggio
        const {selectedUser, messages, lastMessages} = get()
        try {
            // Invocazione della funzione passando il messaggio
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)    
            // Aggiungo ai precedenti messaggi quello ricevuto (per l'utente selezionato),
            // nello stesso modo aggiorno lo stato dell'ultimo messaggio
            set({
                messages: [...messages, res.data],
                lastMessages: {
                    ...lastMessages,
                    [selectedUser._id]: res.data,  
                },
            });
        } catch (error) {
            // Nel caso di errore stampo il messaggio
            window.alert(error.response.data.message)
        }
    },

    // Funzione di sottoscrizione ad un messaggio (per il real time)
    subscribeToMessages: () => {
        // Recupero la connessione al socket
        const socket = useAuthStore.getState().socket;
    
        // Mi metto in ascolto di un nuovo messaggio
        socket.on("newMessage", (newMessage) => {
            set((state) => {
                // Perverificare se il messaggio proviene dall'utente selezionato nella chat
                const isCurrentChat = (state.selectedUser && state.selectedUser._id === newMessage.senderId);
    
                // Se il messaggio è della chat attuale, la aggiorno
                const updatedMessages = isCurrentChat ? [...state.messages, newMessage] : state.messages;
    
                // Modifico i messaggi, l'ultimo messaggio
                return {
                    messages: updatedMessages,
                    lastMessages: {
                        ...state.lastMessages,
                        [newMessage.senderId]: newMessage,
                    }
                };
            });
        });
    },
    
    // Funzione invocata nel caso di logout oppure chiusura della finestra
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    // Funzione che gestisce lo stato dell'utente
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    // Funzione per gestire lo stato della chiamata, stream e peerStream
    setIsVideoCallOpen: (isOpen) => set({ isVideoCallOpen: isOpen }),
    setStream: (stream) => set({ stream }),
    setPeerStream: (peerStream) => set({ peerStream })
}));
