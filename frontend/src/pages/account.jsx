import { useContext } from "react";
import api from "../api";
import { AuthContext } from "../components/authContext";
import { NavLink, useNavigate } from "react-router-dom";

export default function Account() {
    const {user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err)
        }
    };

     return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Compte</h1>

      <div className="mb-4">
        <p><strong>Nom :</strong> {user?.nom}</p>
        <p><strong>Prénom :</strong> {user?.prenom}</p>
        <p><strong>Email :</strong> {user?.email}</p>
        {/* Ajoute d'autres infos utilisateur si tu veux */}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Se déconnecter
      </button>
    </div>
  );
}