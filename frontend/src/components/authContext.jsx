import { createContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingAuth }}> 
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };