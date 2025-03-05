import {useChatStore} from "../store/useChatStore"
import "../Chat.css"
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

// HomePage: pagina contenente la Sidebar (per i contatti) e nel caso in cui non
// ci sia nessun utente selezionato, si mostrerà una pagina iniziale (NoChatSelected), 
// altrimenti la specifica chat (ChatContainer)
function HomePage () {
  // Restituisce l'utente selezionato
  const {selectedUser} = useChatStore()
  return (
    <div id="frame">
      <Sidebar />
      {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
    </div>
  )
}

export default HomePage;