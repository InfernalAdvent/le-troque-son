import { useState, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../components/authContext";
import api from "../api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const {setUser} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const res = await api.post("/auth/login", {email, password});
            const userRes = await api.get("/auth/me");
            setUser(userRes.data);
            
            console.log("Connexion réussie :", res.data);
            navigate("/");
            
        } catch (err) {
            console.error("Erreur de connexion :", err);
            setError(err.response?.data?.message || "Identifiants incorrects");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-violet-600 mb-6">Connexion</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-violet-600"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-violet-600"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 mt-4">
                    Pas encore de compte ?{" "}
                    <NavLink to="/inscription" className="text-violet-600 hover:underline">
                        S'inscrire
                    </NavLink>
                </p>
            </div>
        </div>
    );
}