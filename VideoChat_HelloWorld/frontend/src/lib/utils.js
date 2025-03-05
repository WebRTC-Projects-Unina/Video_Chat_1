// Formato data/ora
export function formatMessageTime(date) {
  // Creazione di due oggetti data (oggi e data del messaggio)
  const messageDate = new Date(date);
  const today = new Date();

  // Si verifica se il messaggio è di oggi
  const isToday =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  // Se di oggi, si stampa l'orario del messaggio
  if (isToday) {
    return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    
  // Altrimenti si stampa il GG/MM/AA
  } else {
    return messageDate.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
  }
}
