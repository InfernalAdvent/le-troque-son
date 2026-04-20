import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../components/authContext";
import { MapPin, Camera } from "lucide-react";
import AvatarDefault from '../assets/avatar-default.svg'
import AnnoncesCard from "../components/annoncesCard";
import { getPhotoForAnnonce } from "../utils/getPhotoForAnnonce";
import api from "../api";

export default function UserProfile() {
    const { user, loadingAuth } = useContext(AuthContext); // Utilisateur connecté
    const { id } = useParams(); // ID depuis l'URL (undefined si on est sur /compte)
    
    // Si pas d'ID dans l'URL, on affiche le profil de l'utilisateur connecté
    const profileUserId = id || user?.id;
    const isOwnProfile = user && profileUserId === user.id;

    const [profileUser, setProfileUser] = useState(null);
    const [annoncesUser, setAnnoncesUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const [wishlistText, setWishlistText] = useState("");
    const [editingWishlist, setEditingWishlist] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const avatarInputRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return "Non spécifié";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long"
        });
    };

    const handleSaveWishlist = async () => {
        try {
            const trimmed = wishlistText.trim();

            if (!trimmed) {
                // Texte vide → supprimer la wishlist existante si elle existe
                const existingId = wishlist[0]?.id;
                if (existingId) {
                    await api.delete(`/wishlist/${existingId}`);
                }
                setWishlistText("");
                await fetchWishlist();
                setEditingWishlist(false);
                return;
            }

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
        } finally {
            setEditingWishlist(false);
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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await api.post('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Mettre à jour l'avatar dans le state
            setProfileUser({ ...profileUser, avatar_url: res.data.avatar_url });
        } catch (err) {
            console.error('Erreur upload avatar:', err);
            alert('Erreur lors de l\'upload');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Supprimer votre avatar ?')) return;

        try {
            await api.delete('/users/avatar');
            setProfileUser({ ...profileUser, avatar_url: null });
        } catch (err) {
            console.error('Erreur suppression avatar:', err);
        }
    };

    useEffect(() => {
        if (loadingAuth) return;

        if (!profileUserId) return;

        const fetchData = async () => {
            setLoading(true);

            try {
                
                const userRes = await api.get(`/users/${profileUserId}`);
                 setProfileUser(userRes.data);
                
                const annoncesRes = await api.get(`/annonces/user/${profileUserId}`);
                setAnnoncesUser(annoncesRes.data);
            } catch (err) {
                console.error("Erreur chargement profil:", err);
            } finally {
                setLoading(false);
            }

            fetchWishlist();
        };

        fetchData();
    }, [profileUserId, isOwnProfile, user, loadingAuth , fetchWishlist, id]);

    const getPhoto = (annonce) => getPhotoForAnnonce(annonce.photos);

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
                    <div className="flex items-center gap-4 mb-6">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={profileUser.avatar_url 
                                    ? profileUser.avatar_url
                                    : AvatarDefault
                                }
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-green-600"
                            />
                            
                            {isOwnProfile && (
                                <button
                                    onClick={() => avatarInputRef.current.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-800 cursor-pointer disabled:opacity-50"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                            
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        
                        {/* Nom + bouton supprimer avatar */}
                        <div className="flex-1">
                            <h2 className="text-2xl text-green-600 font-bold mb-2">
                                {isOwnProfile ? `${profileUser.pseudo}` : `Profil de ${profileUser.pseudo}`}
                            </h2>
                            
                            {isOwnProfile && profileUser.avatar_url && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="text-sm text-red-600 hover:underline cursor-pointer"
                                >
                                    Supprimer l'avatar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">                        
                        {isOwnProfile ? (
                            <>
                                <p className="text-gray-700 flex items-center gap-1"> 
                                    <MapPin size={18} /> 
                                    {profileUser.departement?.nom || profileUser.departement_numero}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-700 flex items-center gap-1">
                                    <MapPin size={18} />
                                    {profileUser.departement?.nom || profileUser.departement_numero}
                                </p>
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
                                placeholder="Listez vos souhaits pour que l'on vous propose des échanges !"
                                className="w-full h-20 bg-white border border-gray-300 rounded-lg p-3 resize-none mb-4"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleSaveWishlist}
                                    className="bg-green-600 hover:bg-green-800 cursor-pointer transition-colors text-white px-4 py-2 rounded-lg"
                                >
                                    {editingWishlist ? "Enregistrer" : "Ajouter"}
                                </button>

                                {editingWishlist && wishlist.length > 0 && (
                                    <button
                                        onClick={handleDeleteWishlist}
                                        className="bg-red-600 hover:bg-red-800 cursor-pointer transition-colors text-white px-4 py-2 rounded-lg"
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
                        <>
                            <div className="bg-white rounded-lg p-4 mb-4"> {/* 👈 Ajoute mb-4 */}
                                <p className="text-gray-800 whitespace-pre-line">{wishlistText}</p>
                            </div>
                            
                            {/* Bouton modifier uniquement pour son propre profil */}
                            {isOwnProfile && (
                                <div className="flex justify-end"> {/* 👈 Ajoute ce wrapper */}
                                    <button
                                        onClick={() => setEditingWishlist(true)}
                                        className="bg-green-600 hover:bg-green-800 cursor-pointer transition-colors text-white px-4 py-2 rounded-lg"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            )}
                        </>
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
                                photo={getPhoto(annonce)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}