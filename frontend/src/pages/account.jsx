import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/authContext";
import AnnoncesCard from "../components/annoncesCard";
import api from "../api";

export default function Account() {
    const { user } = useContext(AuthContext);

    const [annoncesUser, setAnnoncesUser] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return "Non spécifié";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long"
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const annoncesRes = await api.get(`/annonces/user/${user.id}`);

                const photosRes = await api.get("/photos");

                setAnnoncesUser(annoncesRes.data);
                setPhotos(photosRes.data);

            } catch (err) {
                console.error("Erreur chargement annonces user:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const getPhotoForAnnonce = (annonceId) => {
        return photos.find((p) => p.annonce_id === annonceId);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl bg-gray-100 border border-gray-200 shadow-lg rounded-xl p-6">
                <h2 className="text-2xl text-violet-800 font-bold mb-6">Mon Compte</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <p><strong>Pseudo :</strong> {user?.pseudo}</p>
                    <p><strong>Email :</strong> {user?.email}</p>
                    <p><strong>Téléphone :</strong> {user?.telephone}</p>
                    <p><strong>Département :</strong> {user?.departement_numero}</p>
                    <p><strong>Adresse :</strong> {user?.adresse}</p>
                    <p><strong>Ville :</strong> {user?.ville}</p>
                    <p><strong>Code postal :</strong> {user?.code_postal}</p>
                    <p className="font-light">Membre depuis {formatDate(user?.date_inscription)}</p>
                </div>
            </div>

            <div className="mt-12">
                <h1 className="text-4xl text-violet-800 font-bold mb-6">Mes annonces</h1>

                {loading ? (
                    <p className="text-gray-600 text-lg">Chargement...</p>
                ) : annoncesUser.length === 0 ? (
                    <p className="text-gray-600">Vous n’avez pas encore posté d’annonce.</p>
                ) : (
                    <div className="grid grid-cols-1 justify-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {annoncesUser.map((annonce) => (
                            <AnnoncesCard
                                key={annonce.id}
                                annonce={annonce}
                                photo={getPhotoForAnnonce(annonce.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
