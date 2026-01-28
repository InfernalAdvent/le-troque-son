import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../components/authContext";
import AnnoncesCard from "../components/annoncesCard";
import api from "../api";

export default function Account() {
    const { user } = useContext(AuthContext);

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
                // PUT : modifier la wishlist existante
                const existingId = wishlist[0]?.id;
                if (existingId) {
                    await api.put(`/wishlist/${existingId}`, {
                        souhait_texte: wishlistText
                    });
                }
            } else {
                // POST : créer la wishlist
                await api.post("/wishlist", {
                    user_id: user.id,
                    souhait_texte: wishlistText
                });
            }

            // Rafraîchir la wishlist
            await fetchWishlist();

            // Revenir en mode lecture seule après l'enregistrement, même après update
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
        if (!user) return;

        try {
            setLoadingWishlist(true);
            const res = await api.get(`/wishlist/user/${user.id}`);
            setWishlist(res.data);

            // Mettre à jour le texte, mais ne pas activer l'édition automatiquement
            if (res.data.length > 0) {
                setWishlistText(res.data.map(item => item.souhait_texte).join("\n"));
                // on supprime setEditingWishlist(true)
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
    }, [user]);


    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                const annoncesRes = await api.get(`/annonces/user/${user.id}`);
                setAnnoncesUser(annoncesRes.data);
            } catch {
                setAnnoncesUser([]);
            }

            try {
                const photosRes = await api.get("/photos");
                setPhotos(photosRes.data);
            } catch {
                setPhotos([]);
            }

            setLoading(false);
            fetchWishlist();
        };

        fetchData();
    }, [user, fetchWishlist]);



    const getPhotoForAnnonce = (annonceId) => {
        return photos.find((p) => p.annonce_id === annonceId);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-100 rounded-xl p-6">
                        <h2 className="text-2xl text-violet-800 font-bold mb-6">
                            Mon compte
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p><strong>Pseudo :</strong> {user?.pseudo}</p>
                            <p><strong>Email :</strong> {user?.email}</p>
                            <p><strong>Téléphone :</strong> {user?.telephone}</p>
                            <p><strong>Département :</strong> {user?.departement_numero}</p>
                            <p><strong>Adresse :</strong> {user?.adresse}</p>
                            <p><strong>Ville :</strong> {user?.ville}</p>
                            <p><strong>Code postal :</strong> {user?.code_postal}</p>
                            <p className="font-light sm:col-span-2">
                                Membre depuis {formatDate(user?.date_inscription)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-6">
                        <h2 className="text-2xl text-violet-800 font-bold mb-6">
                            Ma wishlist
                        </h2>

                        {loadingWishlist ? (
                            <p className="text-gray-600">Chargement...</p>
                        ) : wishlist.length === 0 || editingWishlist ? (
                            <>
                                <textarea
                                    value={wishlistText}
                                    onChange={(e) => setWishlistText(e.target.value)}
                                    placeholder="Ex: Fender AM PRo II, Marshall JCM 800, Nirvana - Nevermind en vinyle..."
                                    className="w-full h-40 border border-gray-300 rounded-lg p-3 resize-none mb-4"
                                />

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveWishlist}
                                        className="bg-violet-600 hover:bg-violet-800 transition-colors text-white px-4 py-2 rounded-lg"
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
                        ) : (
                            // Vue "lecture seule" quand wishlist existe et pas en édition
                            <div className="bg-white rounded-lg p-4">
                                <p className="text-gray-800 whitespace-pre-line">{wishlistText}</p>
                                <button
                                    onClick={() => setEditingWishlist(true)}
                                    className="mt-2 bg-violet-600 hover:bg-violet-800 transition-colors text-white px-4 py-2 rounded-lg"
                                >
                                    Modifier
                                </button>
                            </div>
                        )}
                    </div>


                </div>
            </div>       

            <div className="mt-12">
                <h1 className="text-4xl text-violet-800 font-bold mb-6">Mes annonces</h1>

                {loading ? (
                    <p className="text-gray-600 text-lg">Chargement...</p>
                ) : annoncesUser.length === 0 ? (
                    <p className="text-gray-600">Vous n’avez pas encore posté d’annonce.</p>
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
