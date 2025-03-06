import { useAuthStore } from "../store/useAuthStore";

// Navbar: è mostrata non appena l'utente è loggato e mi permette di visualizzare il bottone di logout
function Navbar () {
  // Richiamo delle funzioni/elementi di AuthStore
  const { logout, authUser } = useAuthStore();

  return (
    <div>
        {/* Se l'utente è loggato, visualizza il bottone */}
        {authUser && (
          <button onClick={logout} className="btn-logout">
            Logout <ion-icon name="log-out-outline"></ion-icon> 
          </button>
        )}
    </div>

  );
};
export default Navbar;