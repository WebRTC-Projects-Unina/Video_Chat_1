import { useChatStore } from "../store/useChatStore";
import Navbar from '../components/Navbar'
import { useAuthStore } from "../store/useAuthStore";

// ChatHeader: contiene le informazioni generali dell'utente (nome, cognome, stato e immagine profilo)
function ChatHeader () {
  // Richiamo l'utente selezionato
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="user-btn">
        {/* Se l'utente ha un immagine profilo è mostrata altrimenti si visualizza l'avatar */}
        <img className="user-img" src={selectedUser.profilePic || "/avatar.png"} />
        <div className="block">
          {/* nome e cognome */}
          <p className="name">{selectedUser.name} {selectedUser.surname}</p>
          {/* stato */}
          <p className="preview">{onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}</p>
        </div>
    		{/* Per il logout */}
        <Navbar></Navbar>
    </div>
  );
};
export default ChatHeader;