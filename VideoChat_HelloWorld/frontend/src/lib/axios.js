import axios from 'axios'
// Axios è una alternativa ad AJAX per semplificare la gestione di richieste e risposte. 
// Rispetto ad AJAX gestisce in modo più semplice gli errori
// e mi permette di effettuare richieste verso il server più semplici

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000", // URL del SERVER
    withCredentials: true // in questo modo vengono salvati i cookies
})