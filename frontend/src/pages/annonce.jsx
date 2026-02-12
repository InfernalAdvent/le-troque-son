import { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/authContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useDragAndDrop } from '../components/useDragAndDrop';
import api from "../api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Annonce() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [annonce, setAnnonce] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [newPhotos, setNewPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [editModePhotos, setEditModePhotos] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const mainSwiperRef = useRef(null);

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSave = async () => {
        try {
            // 1️⃣ Mettre à jour uniquement les infos de l'annonce
            await api.put(`/annonces/${annonce.id}`, formData);

            // 4️⃣ Mettre à jour l’annonce côté front
            setAnnonce({ ...annonce, ...formData });
            setEditMode(false);
        } catch (err) {
            console.error("Erreur mise à jour annonce/photos", err);
            if (err.response) {
            // affiche l'erreur du serveur si dispo
            alert(`Erreur serveur : ${err.response.data.message || err.response.statusText}`);
            } else {
            alert("Erreur lors de la mise à jour");
            }
        }
        };

const handleSavePhotos = async () => {
    if (newPhotos.length === 0) return;

    const formDataPhotos = new FormData();
    newPhotos.forEach(f => formDataPhotos.append("photos", f.file));
    formDataPhotos.append("annonce_id", annonce.id);

    try {
        setUploading(true);
        await api.post(`/photos/upload`, formDataPhotos, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // Recharger les photos après upload
        const photosRes = await api.get(`/photos/annonce/${annonce.id}`);
        setPhotos(photosRes.data || []);

        // Révoquer les previews
        newPhotos.forEach(p => URL.revokeObjectURL(p.url));
        setNewPhotos([]);
        alert("Photos enregistrées avec succès !");
    } catch (err) {
        console.error("Erreur ajout photos", err);
        alert("Erreur lors de l’ajout des photos");
    } finally {
        setUploading(false);
    }
};

    const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPhotoObjs = files.map(f => ({
        id: `new-${Date.now()}-${f.name}`,
        file: f,
        url: URL.createObjectURL(f),
        isNew: true
    }));
    setNewPhotos(prev => [...prev, ...newPhotoObjs].slice(0, 5));
};

    const handleAddPhotos = async () => {
    if (newPhotos.length === 0) return;

    const photoformData = new FormData();
    newPhotos.forEach(({ file }) => photoformData.append("photos", file));
    photoformData.append("annonce_id", annonce.id);

    try {
        setUploading(true);
        await api.post(`/photos/upload`, photoformData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const photosRes = await api.get(`/photos/annonce/${annonce.id}`);
        setPhotos(photosRes.data || []);
        // révoquer les previews
        newPhotos.forEach(p => URL.revokeObjectURL(p.preview));
        setNewPhotos([]);
    } catch (err) {
        console.error("Erreur ajout photos", err);
        alert("Erreur lors de l’ajout des photos");
    } finally {
        setUploading(false);
    }
};

    const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
        photos,
        newPhotos,
        async (reorderedPhotos) => {
            // ✅ Mettre à jour la propriété ordre localement
            const photosWithNewOrder = reorderedPhotos.map((photo, idx) => ({
                ...photo,
                ordre: idx
            }));

            const existingPhotos = photosWithNewOrder.filter(p => !p.isNew);
            const newPhotosOnly = photosWithNewOrder.filter(p => p.isNew);

            setPhotos(existingPhotos);
            setNewPhotos(newPhotosOnly);

            // Sauvegarder en BDD
            try {
                await api.put(`/photos/ordre/${annonce.id}`, {
                    photoIds: existingPhotos.map((p, idx) => ({ id: p.id, ordre: idx }))
                });
            } catch (err) {
                console.error("Erreur mise à jour ordre", err);
            }
        }
    );

    const handleDeletePhoto = async (photoId, isNew = false) => {
        if (!confirm("Supprimer cette photo ?")) return;

        if (isNew) {
            // Supprimer la photo côté front
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            return;
        }

        try {
            await api.delete(`/photos/${photoId}`);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) {
            console.error("Erreur suppression photo", err);
            alert("Erreur lors de la suppression");
        }
    };

    const handleDeleteAnnonce = async () => {
        if (!confirm("Supprimer définitivement cette annonce ?")) return;

        try {
            await api.delete(`/annonces/${annonce.id}`);
            navigate("/");
        } catch (err) {
            console.error("Erreur suppression annonce", err);
            alert("Erreur lors de la suppression de l’annonce");
        }
    };

    useEffect(() => {
        const fetchAnnonce = async () => {
            try {
                setLoading(true);
                const annonceRes = await api.get(`/annonces/${id}`);
                setAnnonce(annonceRes.data);

                const photosRes = await api.get(`/photos/annonce/${id}`);
                setPhotos(photosRes.data || []);
            } catch (err) {
                console.error("Erreur chargement annonce :", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnonce();
    }, [id]);

    useEffect(() => {
        if (annonce) {
            setFormData({
            titre: annonce.titre,
            description: annonce.description,
            prix: annonce.prix,
            etat: annonce.etat,
            echange_souhaite_texte: annonce.echange_souhaite_texte,
            ville: annonce.ville,
            code_postal: annonce.code_postal,
            });
        }
        }, [annonce]);

    const isOwner = user && annonce?.user ? user.id === annonce.user.id : false;

    if (loading || !annonce) {
     return <p className="text-center mt-10">Chargement...</p>;
    }


    return (
        <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="mb-4">
                {photos.length === 0 ? (
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center relative">
                        {/* Bouton + pour ajouter des photos quand il n'y a aucune image */}
                        {isOwner && editMode && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-violet-500 rounded-lg cursor-pointer hover:bg-violet-50 transition"
                                >
                                    <span className="text-3xl text-violet-600 font-bold">+</span>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoSelect}
                                />
                                {newPhotos.length > 0 && (
                                    <button
                                        onClick={handleAddPhotos}
                                        disabled={uploading}
                                        className="ml-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
                                    >
                                        {uploading ? "Ajout en cours..." : `Ajouter ${newPhotos.length} photo(s)`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Carousel principal */}
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{ clickable: true }}
                            spaceBetween={16}
                            slidesPerView={1}
                            className="rounded-xl overflow-hidden"
                            onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                            onSlideChange={(swiper) => setSelectedPhotoIndex(swiper.activeIndex)}
                        >
                            {photos
                                .sort((a, b) => a.ordre - b.ordre)
                                .map((photo) => (
                                    <SwiperSlide key={photo.id}>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${photo.url}`}
                                            alt={annonce.titre}
                                            className="h-[500px] object-cover mx-auto cursor-zoom-in rounded-lg"
                                            onClick={() => setIsModalOpen(true)}
                                        />
                                    </SwiperSlide>
                                ))}
                        </Swiper>

                        {/* Miniatures */}
                        <div className="flex justify-center mt-4 gap-3 flex-wrap items-center">
                            {[...photos, ...newPhotos]
                            .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                            .map((photo, index) => (
                            <div 
                            key={photo.id} 
                            className="relative"
                            draggable={isOwner && editMode}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index)}>
                                <img
                                src={photo.isNew ? photo.url : `${import.meta.env.VITE_API_URL}${photo.url}`}
                                alt="miniature"
                                className={`h-20 w-20 object-cover rounded-lg cursor-pointer border-2 hover:cursor-grab ${
                                    selectedPhotoIndex === index ? "border-violet-700" : "border-transparent"
                                }`}
                                onClick={() => {
                                    mainSwiperRef.current?.slideTo(index);
                                    setSelectedPhotoIndex(index);
                                }}
                                />
                                {isOwner && editModePhotos && (
                                <button
                                    onClick={() => {
                                    if(photo.isNew) {
                                        setNewPhotos(prev => prev.filter(p => p.id !== photo.id));
                                    } else {
                                        handleDeletePhoto(photo.id, false);
                                    }
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                                >
                                    ×
                                </button>
                                )}
                            </div>
                            ))}


                            {/* Bouton + pour ajouter des photos */}
                            {isOwner && editModePhotos && (
                                <div className="flex items-center gap-4">
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-violet-500 rounded-lg cursor-pointer hover:bg-violet-50 transition"
                                >
                                    <span className="text-3xl text-violet-600 font-bold">+</span>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoSelect}
                                />
                                </div>
                            )}
                            {isOwner && editModePhotos && newPhotos.length > 0 && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={handleSavePhotos}
                                        disabled={uploading}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {uploading ? "Envoi..." : `Enregistrer ${newPhotos.length} photo(s)`}
                                    </button>
                                </div>  
                            )}
                            </div>

                            {/* Bouton édition photos */}
                        {isOwner && (
                            <div className="flex justify-center mt-4">
                                {!editModePhotos ? (
                                    <button
                                        onClick={() => setEditModePhotos(true)}
                                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                                    >
                                        Modifier les photos
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditModePhotos(false);
                                            setNewPhotos([]); // Annuler les nouvelles photos non sauvegardées
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        Terminer
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Modal agrandie */}
                        {isModalOpen && (
                            <div
                                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${photos[selectedPhotoIndex].url}`}
                                    alt="Agrandissement"
                                    className="max-h-[90vh] max-w-[90vw] rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {editMode ? (
                <input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full bg-white text-violet-800 text-3xl border rounded px-2 py-1 mb-4"
                />
                ) : (
                <h1 className="text-3xl font-bold text-violet-800 mb-4">
                    {annonce.titre}
                </h1>
                )}
            {editMode ? (
                <input
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                    className="w-full bg-white text-violet-800 text-3xl border rounded px-2 py-1 mb-4"
                />
                ) :( 
                    <p className="text-xl font-semibold mb-4">{annonce.prix} €</p>
                )}
            
            <p className="text-gray-500">Publiée le {formatDateTime(annonce.date_publication)}</p>

            <div className="bg-gray-100 rounded-xl p-6 mt-8">
                <h2 className="text-xl font-semibold text-violet-800 mb-4">Description</h2>
                {editMode ? (
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full bg-white text-violet-800 text-xl border rounded px-2 py-1 mb-4"
                    />
                ) :(
                    <p>{annonce.description}</p>
                )}
                
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-xl p-6 mt-8">
                    <h2 className="text-xl font-semibold text-violet-800 mb-4">Détails de l'annonce</h2>
                    {editMode ? (
                <select
                    value={formData.etat}
                    onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                    className="w-full bg-white text-violet-800 border rounded px-2 py-1 mb-4"
                >
                    <option value="Comme neuf">Comme neuf</option>
                    <option value="Très bon état">Très bon état</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Usagé">Usagé</option>
                </select>
                ) :( 
                    <p><strong>État :</strong> {annonce.etat}</p>
                )}
                    
                {editMode ? (
                <input
                    value={formData.echange_souhaite_texte}
                    onChange={(e) => setFormData({ ...formData, echange_souhaite_texte: e.target.value })}
                    className="w-full bg-white text-violet-800 border rounded px-2 py-1 mb-4"
                />
                ) :( 
                    <p><strong>Échange possible contre :</strong> {annonce.echange_souhaite_texte}</p>
                )}
                {editMode ? (
                <input
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full bg-white text-violet-800 border rounded px-2 py-1 mb-4"
                />
                ) :( 
                    <p><strong>Ville :</strong> {annonce.ville}</p>
                )}                    
                {editMode ? (
                <input
                    value={formData.code_postal}
                    onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                    className="w-full bg-white text-violet-800 border rounded px-2 py-1 mb-4"
                />
                ) :( 
                    <p><strong>Code Postal :</strong> {annonce.code_postal}</p>
                )}
                
                </div>

                <div className="bg-gray-100 rounded-xl p-6 lg:mt-8">
                    <h2 className="text-xl font-semibold text-violet-800 mb-4">Vendu par</h2>

                    {/* Bloc texte */}
                    <div>
                        <p>
                        <strong>
                            <Link
                            to={`/profil/${annonce?.user?.id}`}
                            className="text-violet-600 hover:underline"
                            >
                            {annonce.user?.pseudo || "Utilisateur inconnu"}
                            </Link>
                        </strong>
                        </p>
                        <p className=" text-gray-600">
                        Membre depuis le {formatDateTime(annonce?.user?.date_inscription)}
                        </p>
                        <p className=" text-gray-600">
                        Dernière connexion le {formatDateTime(annonce?.user?.derniere_connexion)}
                        </p>
                    </div>

                    {/* Bouton aligné à droite sous le texte */}
                    {!isOwner && (
                    <div className="flex justify-end mt-4">
                        <button
                        onClick={() => {
                            console.log("Contacter le vendeur", annonce.user?.id);
                        }}
                        className="px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition"
                        >
                        Contacter
                        </button>
                    </div>
                    )}
                </div>
                
            </div>
            {isOwner && (
                <div className="flex gap-3 mt-4">
                    {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-800 transition"
                    >
                        Modifier l’annonce
                    </button>
                    ) : (
                    <>
                        <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition"
                        >
                        Enregistrer
                        </button>
                        <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                        Annuler
                        </button>
                    </>
                    )}
                </div>
                )}
                {isOwner && (
                    <div className="mt-8">
                        <button
                            onClick={handleDeleteAnnonce}
                            className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
                        >
                            Supprimer l’annonce
                        </button>
                    </div>
                )}
        </div>
    );
}
