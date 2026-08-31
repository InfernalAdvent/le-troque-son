import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false, // On connecte manuellement selon l'auth
  withCredentials: true, // Envoie le cookie JWT
});

socket.on("connect", () => console.log("✅ Socket connectée:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket déconnectée"));
socket.on("connect_error", (err) =>
  console.log("🔴 Erreur socket:", err.message),
);

export default socket;
