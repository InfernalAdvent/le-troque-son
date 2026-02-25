import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../api";

export default function Signup() {
    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        confirmPassword: "",
        pseudo: "",
        telephone: "",
        adresse: "",
        ville: "",
        code_postal: "",
        departement_numero: ""
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        
        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }
        
        setLoading(true);
        
        try {
            const { confirmPassword: _confirmPassword, ...dataToSend } = formData;
            
            const res = await api.post("/auth/signup", dataToSend);
            
            console.log("Inscription réussie :", res.data);
            
            navigate("/login");
            
        } catch (err) {
            console.error("Erreur inscription :", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen py-12">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-green-600 mb-6">Créer un compte</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    {/* Ligne 1 : Prénom et Nom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom *
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                required
                                value={formData.prenom}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom *
                            </label>
                            <input
                                type="text"
                                name="nom"
                                required
                                value={formData.nom}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                    </div>
                    
                    {/* Pseudo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pseudo *
                        </label>
                        <input
                            type="text"
                            name="pseudo"
                            required
                            value={formData.pseudo}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                        />
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                        />
                    </div>
                    
                    {/* Ligne 2 : Mot de passe et Confirmation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                    </div>
                    
                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone 
                        </label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                        />
                    </div>
                    
                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse *
                        </label>
                        <input
                            type="text"
                            name="adresse"
                            required
                            value={formData.adresse}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                        />
                    </div>
                    
                    {/* Ligne 3 : Ville, Code Postal, Département */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ville *
                            </label>
                            <input
                                type="text"
                                name="ville"
                                required
                                value={formData.ville}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code Postal *
                            </label>
                            <input
                                type="text"
                                name="code_postal"
                                required
                                value={formData.code_postal}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Département *
                            </label>
                            <input
                                type="text"
                                name="departement_numero"
                                required
                                value={formData.departement_numero}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-800 cursor-pointer text-white font-medium py-3 rounded-lg transition-colors disabled:bg-gray-400 mt-6"
                    >
                        {loading ? "Inscription en cours..." : "S'inscrire"}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 mt-4">
                    Déjà un compte ?{" "}
                    <NavLink to="/login" className="text-green-600 hover:underline">
                        Se connecter
                    </NavLink>
                </p>
            </div>
        </div>
    );
}