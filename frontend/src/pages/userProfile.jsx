import { useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../components/authContext";
import AnnoncesCard from "../components/annoncesCard";
import api from "../api";

export default function UserProfile() {
    const { user, loadingAuth } = useContext(AuthContext); // Utilisateur connecté
    const { id } = useParams(); // ID depuis l'URL (undefined si on est sur /compte)
    
    // Si pas d'ID dans l'URL, on affiche le profil de l'utilisateur connecté
    const profileUserId = id || user?.id;
    const isOwnProfile = user && profileUserId === user.id;

    const [profileUser, setProfileUser] = useState(null);
    const [annoncesUser, setAnnoncesUser] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const [wishlistText, setWishlistText] = useState("");
    const [editingWishlist, setEditingWishlist] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "Non spécifié";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long"
        });
    };

    const handleSaveWishlist = async () => {
        try {
            if (editingWishlist) {
                const existingId = wishlist[0]?.id;
                if (existingId) {
                    await api.put(`/wishlist/${existingId}`, {
                        souhait_texte: wishlistText
                    });
                }
            } else {
                await api.post("/wishlist", {
                    user_id: user.id,
                    souhait_texte: wishlistText
                });
            }

            await fetchWishlist();
            setEditingWishlist(false);
        } catch (err) {
            console.error("Erreur sauvegarde wishlist:", err);
        }
    };

    const handleDeleteWishlist = async () => {
        if (!wishlist[0]?.id) return;
        if (!confirm("Supprimer votre wishlist ?")) return;

        try {
            await api.delete(`/wishlist/${wishlist[0].id}`);
            setWishlistText("");
            setEditingWishlist(false);
            fetchWishlist();
        } catch (err) {
            console.error("Erreur suppression wishlist:", err);
        }
    };

    const fetchWishlist = useCallback(async () => {
        if (!profileUserId) return;

        try {
            setLoadingWishlist(true);
            const res = await api.get(`/wishlist/user/${profileUserId}`);
            setWishlist(res.data);

            if (res.data.length > 0) {
                setWishlistText(res.data.map(item => item.souhait_texte).join("\n"));
            } else {
                setWishlistText("");
                setEditingWishlist(false);
            }
        } catch (err) {
            console.error("Erreur chargement wishlist:", err);
            setWishlist([]);
            setWishlistText("");
            setEditingWishlist(false);
        } finally {
            setLoadingWishlist(false);
        }
    }, [profileUserId]);

    useEffect(() => {
        if (loadingAuth) return;

        if (!profileUserId) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                // Si c'est son propre profil, on utilise les données du contexte
                // Sinon on fetch les données publiques
                if (isOwnProfile) {
                    setProfileUser(user);
                } else {
                    const userRes = await api.get(`/users/${profileUserId}`);
                    setProfileUser(userRes.data);
                }

                const annoncesRes = await api.get(`/annonces/user/${profileUserId}`);
                setAnnoncesUser(annoncesRes.data);

                const photosRes = await api.get("/photos");
                setPhotos(photosRes.data);
            } catch (err) {
                console.error("Erreur chargement profil:", err);
            } finally {
                setLoading(false);
            }

            fetchWishlist();
        };

        fetchData();
    }, [profileUserId, isOwnProfile, user, loadingAuth , fetchWishlist, id]);

    const getPhotoForAnnonce = (annonceId) => {
        return photos.find(photo => 
        photo.annonce_id === annonceId && photo.ordre === 0
        ) || photos.find(photo => photo.annonce_id === annonceId); 
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 text-lg">Chargement...</p>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-700 text-lg">Utilisateur introuvable</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-xl p-6">
                    <h2 className="text-2xl text-green-600 font-bold mb-6">
                        {isOwnProfile ? "Mon compte" : `Profil de ${profileUser.pseudo}`}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">                        
                        {/* Afficher toutes les infos si c'est son propre profil */}
                        {isOwnProfile ? (
                            <>
                                <p className="text-gray-700"><strong className="text-black">Pseudo :</strong> {profileUser.pseudo}</p>
                                <p className="text-gray-700"><strong className="text-black">Email :</strong> {profileUser.email}</p>
                                <p className="text-gray-700"><strong className="text-black">Téléphone :</strong> {profileUser.telephone}</p>
                                <p className="text-gray-700"><strong className="text-black">Département :</strong> {profileUser.departement_numero}</p>
                                <p className="text-gray-700"><strong className="text-black">Adresse :</strong> {profileUser.adresse}</p>
                                <p className="text-gray-700"><strong className="text-black">Ville :</strong> {profileUser.ville}</p>
                                <p className="text-gray-700"><strong className="text-black">Code postal :</strong> {profileUser.code_postal}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-700"><strong className="text-black">Département :</strong> {profileUser.departement_numero}</p>
                                <p className="text-gray-700"><strong className="text-black">Ville :</strong> {profileUser.ville}</p>
                            </>
                        )}
                        
                        <p className="font-light sm:col-span-2">
                            Membre depuis {formatDate(profileUser.date_inscription)}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-6">
                    <h2 className="text-2xl text-green-600 font-bold mb-6">
                        {isOwnProfile ? "Ma wishlist" : "Wishlist"}
                    </h2>

                    {loadingWishlist ? (
                        <p className="text-gray-700">Chargement...</p>
                    ) : isOwnProfile && (wishlist.length === 0 || editingWishlist) ? (
                        // Mode édition (uniquement pour son propre profil)
                        <>
                            <textarea
                                value={wishlistText}
                                onChange={(e) => setWishlistText(e.target.value)}
                                placeholder="Ex: Fender AM Pro II, Marshall JCM 800, Nirvana - Nevermind en vinyle..."
                                className="w-full h-40 border border-gray-300 rounded-lg p-3 resize-none mb-4"
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveWishlist}
                                    className="bg-green-600 hover:bg-green-800 transition-colors text-white px-4 py-2 rounded-lg"
                                >
                                    {editingWishlist ? "Enregistrer" : "Ajouter"}
                                </button>

                                {editingWishlist && wishlist.length > 0 && (
                                    <button
                                        onClick={handleDeleteWishlist}
                                        className="bg-red-600 hover:bg-red-800 transition-colors text-white px-4 py-2 rounded-lg"
                                    >
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </>
                    ) : wishlist.length === 0 ? (
                        <p className="text-gray-600">Aucun article pour le moment</p>
                    ) : (
                        // Mode lecture seule
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-line">{wishlistText}</p>
                            
                            {/* Bouton modifier uniquement pour son propre profil */}
                            {isOwnProfile && (
                                <button
                                    onClick={() => setEditingWishlist(true)}
                                    className="mt-2 bg-green-600 hover:bg-green-800 transition-colors text-white px-4 py-2 rounded-lg"
                                >
                                    Modifier
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h1 className="text-4xl text-green-600 font-bold mb-6">
                    {isOwnProfile ? "Mes annonces" : `Annonces de ${profileUser.pseudo}`}
                </h1>

                {annoncesUser.length === 0 ? (
                    <p className="text-gray-600">
                        {isOwnProfile 
                            ? "Vous n'avez pas encore posté d'annonce." 
                            : "Aucune annonce publiée."}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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