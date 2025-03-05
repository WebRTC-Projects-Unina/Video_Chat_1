import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Toaster, toast } from "react-hot-toast";

// MessageInput è la barra di invio dei messaggi. 
// Contiene inoltre i bottoni per selezionare
// le foto da inviare e/o i messaggi
function MessageInput () {
  // Selezione degli stati
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Richiamo il meotodo sendMessage
  const { sendMessage } = useChatStore();

  // Funzione invocata quando un utente seleziona un'immagine
  const handleImageChange = (e) => {
    // Si salva il primo file selezionato
    const file = e.target.files[0];
    
    // Si controlla se il file è un immagine
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Se l'utente seleziona un immagine creiamo un filereader, per leggere il file
    const reader = new FileReader();

    // Successivamente aggiorno lo stato con l'anteprima dell'immagine
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    // Converto il file in una stringa per visualizzarlo come anteprima
    reader.readAsDataURL(file);
  };

  // Funzione per rimuovere l'immagine
  const removeImage = () => {
    // cancello l'anteprima
    setImagePreview(null);

    // Se esiste il riferimento all'input file, lo resetto
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Funzione invocata all'invio del messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault(); // per evitare il refresh della pagina
    
    // Se non c'è un immagine o un testo non si procede
    if (!text.trim() && !imagePreview) return; 

    try {
      // Nella richiesta si invia il msg e l'eventuale immagine
      await sendMessage({
        text: text.trim(), // in modo da cancellare eventuali spazi
        image: imagePreview,
      });

      // Elimino il testo e la foto
      setText("");
      setImagePreview(null);

      // Se esiste il riferimento all'input file, lo resetto
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      // Se non riesco ad inviare il messaggio, mostro un errore
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <Toaster /> {/* Per gestire i messaggi di notifica */}
      {/* Se c'è una preview viene mostrata */}
      {imagePreview && (
        <div className="image-preview-container">
            <img
              src={imagePreview}
              alt="Preview"
              className="image-preview"
            />
            {/* se clicchiamo su questo bottone, rimuoviamo l'immagine */}
            <button onClick={removeImage} type="button"> <ion-icon name="close-outline"></ion-icon> </button>
        </div>
      )}

      {/* Form per l'invio del messaggio */}
      <form onSubmit={handleSendMessage}>
          <div className="message-input">
            <div className="wrap">
              {/* Bottone per la selezione delle immagini */}
              <button
                type="button"
                className="submit"
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Input per le immagini */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <ion-icon name="image-outline"></ion-icon>
              </button>
              
              {/* Input per l'inserimento del testo */}
              <input type="text" placeholder="Write your message..." 
              value={text}
              onChange={(e) => setText(e.target.value)}/>
              
              {/* Bottone per l'invio di messaggi */}
              <button className="submit"><ion-icon name="send-outline"></ion-icon></button>         
              </div>
          </div>
      </form>
    </div>
  );
};
export default MessageInput;