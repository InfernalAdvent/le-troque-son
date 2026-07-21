import { useState, useEffect, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../components/authContext";
import { Eye, EyeOff } from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../api";

export default function Signup() {
    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        confirmPassword: "",
        pseudo: "",
        departement_numero: ""
    });
    
    const [departements, setDepartements] = useState([]);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);
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
        
        if (formData.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
            setError("Le mot de passe doit contenir au moins une majuscule et un chiffre");
            return;
        }
        
        setLoading(true);
        
        try {
            const { confirmPassword: _confirmPassword, ...dataToSend } = formData;
            
            await api.post("/auth/signup", dataToSend);
            
            // Le backend set le cookie JWT automatiquement, on récupère l'utilisateur
            const userRes = await api.get("/auth/me");
            setUser(userRes.data);
            
            navigate("/");
            
        } catch (err) {
            console.error("Erreur inscription :", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDepartements = async () => {
            try {
                const res = await api.get("/departements");
                setDepartements(res.data);
            } catch (err) {
                console.error("Erreur chargement départements:", err);
            }
        };
        
        fetchDepartements();
    }, []);

    return (
        <>
            <Helmet>
                <title>Le Troque Son | Créer un compte</title>
                <meta 
                    name="description" 
                    content="Créez votre compte Le Troque Son et commencez à échanger vos instruments et votre musique dès aujourd'hui !" 
                />
            </Helmet>
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:border-green-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2 text-gray-600 hover:text-green-600 cursor-pointer text-xl"
                                        title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmer le mot de passe *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:border-green-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2 text-gray-600 hover:text-green-600 cursor-pointer text-xl"
                                        title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Département */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Département *
                            </label>
                            <select
                                name="departement_numero" 
                                required
                                value={formData.departement_numero}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
                            >
                                <option value="">Sélectionner un département</option>
                                {departements
                                    .filter(dep => dep && dep.numero && dep.nom)
                                    .map(dep => (
                                        <option key={dep.id} value={dep.numero}>
                                            {dep.numero} - {dep.nom}
                                        </option>
                                    ))}
                            </select>
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
        </>
    );
}