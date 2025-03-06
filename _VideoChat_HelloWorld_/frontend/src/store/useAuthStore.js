import {create} from "zustand"
import {axiosInstance} from "../lib/axios"
import {io} from "socket.io-client"
import toast from "react-hot-toast"

// E' stata utilizzata la libreria zustand per salvare in unico punto utenti e messaggi al
// fine di recuperare più facilmente il contentuo; zustand mi permette di gestire in modo
// più semplice lo stato. Una possibile alternativa sarebbe stata invocare le stesse
// funzioni più volte nelle singole componenti React e gestire lo stato utilizzando useState()

const BASE_URL = "http://localhost:5000" // socket.io

// Gestisce le funzioni legate agli utenti e si occupa della comunicazione verso il server
export const useAuthStore = create((set, get) => ({ 
    authUser: null, // per la verifica dell'utente (inizialmente non so se l'user è autenticato o meno)
    isSigningUp: false, // inizialmente falso (in quanto non registrato)
    isLoggingIn: false, // inizialmente falso (in quanto non "loggato")
    isCheckingAuth: true, // si verifica se l'utente è autenticato o meno al refresh della pagina
    socket: null, // inizialmente lo stato è NULL
    onlineUsers: [], // per la gestione degli utenti online

    // Quando si ricarica la pagina, si vuole verificare se l'user è autenticato o meno
    checkAuth: async() => {
        try {
            // Invio una richiesta al server - "http://localhost:5000/api/check"
            const res = await axiosInstance.get("/auth/check")
            
            // Imposto i valori ricevuti come risposta
            set({authUser: res.data}) 

            // Se è autenticato si connetterà al socket
            get().connectSocket();
        } catch (error) {
            // In caso di errore stampo un messaggio e non salvo nulla
            console.log("Error in checkAuth: ", error);
            set({authUser: null})
        } finally {
            // L'utente è stato "checkato"
            set({isCheckingAuth: false}) 
        }
    },

    // Funzione invocata alla registrazione dell'utente
    signup: async (data) => {
        // Impostiamo lo stato a true
        set({ isSigningUp: true });
        try {
            // Richiamo il metodo di signup passando i dati definiti dall'utente
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created successfully");

            // Si ritarda l'operazione in modo da mostrare il messaggio (toast) precedentemente definito
            setTimeout(()=>{
                // All'utente saranno assegnati i dati ricevuti
                set({ authUser: res.data }); 

                // Connessione al socket
                get().connectSocket();
            },1000)
        } catch (error) {
            // Nel caso in cui ci sia un errore diverso dalla duplicazione della mail (univoca), 
            // si stampa un messaggio di errore
            if (error.code !== 11000) {
                toast.error(error.response.data.message);
            }
        } finally {
            // Infine si imposta lo stato a falso 
            set({ isSigningUp: false });
        }
    },

    // Funzione invocata al login dell'utente
    login: async (data) => {
        // Update dello stato
        set({ isLoggingIn: true }); 
        try {
            // Si richiama il metodo, nel caso di successo si stampa un messaggio
            const res = await axiosInstance.post("/auth/login", data);
            toast.success("Logged in successfully");

            // Si ritarda l'accesso nella pagina principale in modo da permettere la visualizzazione 
            // del messaggio precedentemente definito
            setTimeout(()=>{
                // Imposto le informazioni ricevute
                set({ authUser: res.data }); 
                
                // Una volta loggata, mi connetto al socket
                get().connectSocket(); 
            },1000)
        } catch (error) {
            // Nel caso di errore stampo il messaggio
            toast.error(error.response.data.message);
        } finally {
            // Infine imposto lo stato a false
            set({ isLoggingIn: false });
        }
    },

    // Funzione invocata quando l'utente esce dalla propria area personale
    logout: async () => {
        // Si imposta lo stato a true
        set({isLoggingIn: true})
        try {
            // Richiamo il metodo e stampo il messaggio
            await axiosInstance.post("/auth/logout");
            toast.success("Logged out successfully");
            setTimeout(()=>{
                // Imposto l'utente come null (cancello i cookie) e mi disconnetto
                set({authUser: null}); 
                get().disconnectSocket();
            },500)
        } catch (error) {
            // Stampo un messaggio in caso di errore
            toast.error(error.response.data.message);
        }
    },

    // Funzione che permette la connessione al socket
    connectSocket: () => {
        // Recupero l'utente precedentemente definito
        const {authUser} = get() 
        
        // Se non ci sono utenti oppure l'utente è già connesso, non creo questa connessione
        if(!authUser || get().socket?.connected) return; 
        
        // Si crea la connessione
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        }) 
        // Si connette
        socket.connect()

        // Aggiorno il socket
        set({socket: socket})

        // In ascolto degli user online
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    // Potremmo non implementare questa funzione (in quanto già invocata alla 
    // chiusuta della pagina), ma per correttezza si implementa
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    } 
}))