import { useState } from "react";
import { useSearchParams, useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post("/auth/reset-password", { token, newPassword });
            setMessage(res.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="p-8 rounded-lg shadow-xl w-full max-w-md">
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        Lien invalide. Veuillez refaire une demande de réinitialisation.
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        <NavLink to="/mot-de-passe-oublie" className="text-green-600 hover:underline">
                            Retour
                        </NavLink>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-600 mb-6">Nouveau mot de passe</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
                    )}
                    {message && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{message}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-800 cursor-pointer text-white font-medium py-2 rounded-lg transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    <NavLink to="/login" className="text-green-600 hover:underline">
                        Retour à la connexion
                    </NavLink>
                </p>
            </div>
        </div>
    );
}