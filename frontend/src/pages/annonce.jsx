import { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SquarePen } from "lucide-react"
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
            await api.put(`/annonces/${annonce.id}`, formData);
            setAnnonce({ ...annonce, ...formData });
            setEditMode(false);
        } catch (err) {
            console.error("Erreur mise à jour annonce", err);
            if (err.response) {
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

            const photosRes = await api.get(`/photos/annonce/${annonce.id}`);
            setPhotos(photosRes.data || []);

            newPhotos.forEach(p => URL.revokeObjectURL(p.url));
            setNewPhotos([]);
            setEditModePhotos(false);
            alert("Photos enregistrées avec succès !");
        } catch (err) {
            console.error("Erreur ajout photos", err);
            alert("Erreur lors de l'ajout des photos");
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
        setNewPhotos(prev => [...prev, ...newPhotoObjs].slice(0, 10));
    };

    const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
        photos,
        newPhotos,
        async (reorderedPhotos) => {
            const photosWithNewOrder = reorderedPhotos.map((photo, idx) => ({
                ...photo,
                ordre: idx
            }));

            const existingPhotos = photosWithNewOrder.filter(p => !p.isNew);
            const newPhotosOnly = photosWithNewOrder.filter(p => p.isNew);

            setPhotos(existingPhotos);
            setNewPhotos(newPhotosOnly);

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
            setNewPhotos(prev => prev.filter(p => p.id !== photoId));
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

    const handleContact = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Créer ou récupérer la conversation
            const res = await api.post('/conversations', {
                annonceId: annonce.id,
                receveurId: annonce.user_id
            });

            // Rediriger vers la page messages avec cette conversation sélectionnée
            navigate('/messages', { state: { conversationId: res.data.id } });
        } catch (err) {
            console.error('Erreur création conversation:', err);
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
        <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="mb-4">
                {photos.length === 0 && newPhotos.length === 0 ? (
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center relative">
                        {isOwner && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-green-600 rounded-lg cursor-pointer hover:bg-green-50 transition"
                                >
                                    <span className="text-3xl text-green-600 font-bold">+</span>
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
                    </div>
                ) : (
                    <>
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
                                            className="h-112.5 w-full object-contain cursor-zoom-in rounded-lg"
                                            onClick={() => setIsModalOpen(true)}
                                        />
                                    </SwiperSlide>
                                ))}
                        </Swiper>

                        <div className="flex justify-center mt-4 gap-3 flex-wrap items-center">
                            {[...photos, ...newPhotos]
                                .map((photo, index) => (
                                    <div 
                                        key={photo.id} 
                                        className="relative"
                                        draggable={isOwner && editModePhotos}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(index)}
                                    >
                                        <img
                                            src={photo.isNew ? photo.url : `${import.meta.env.VITE_API_URL}${photo.url}`}
                                            alt="miniature"
                                            className={`h-20 w-20 object-cover rounded-lg cursor-pointer border-2 ${
                                                selectedPhotoIndex === index ? "border-green-600" : "border-transparent"
                                            } ${editModePhotos ? "cursor-grab" : ""}`}
                                            onClick={() => {
                                                mainSwiperRef.current?.slideTo(index);
                                                setSelectedPhotoIndex(index);
                                            }}
                                        />
                                        {isOwner && editModePhotos && (
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id, photo.isNew)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}

                            {isOwner && editModePhotos && (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-green-600 rounded-lg cursor-pointer hover:bg-green-50 transition"
                                >
                                    <span className="text-3xl text-green-600 font-bold">+</span>
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
                        </div>

                        {isModalOpen && photos[selectedPhotoIndex] && (
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

                {isOwner && (
                    <div className="flex justify-center mt-4">
                        {/* CAS 1 : Photos en attente d'upload */}
                        {newPhotos.length > 0 ? (
                            <button
                                onClick={handleSavePhotos}
                                disabled={uploading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {uploading ? "Envoi..." : `Enregistrer les photos`}
                            </button>
                        ) : 
                        /* CAS 2 : Mode édition + photos en BDD */
                        editModePhotos && photos.length > 0 ? (
                            <button
                                onClick={() => setEditModePhotos(false)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Terminer
                            </button>
                        ) : 
                        /* CAS 3 : Photos en BDD  */
                        !editModePhotos && photos.length > 0 ? (
                            <button
                                onClick={() => setEditModePhotos(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition"
                            >
                                Modifier les photos
                            </button>
                        ) : 
                        /* CAS 4 : Aucune photos -> boutons non affichés */
                        null}
                    </div>
                )}
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-6 mb-4">
                <div className="flex-1 w-full">
                    {editMode ? (
                        <input
                            value={formData.titre || ""}
                            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                            className="w-full bg-white text-gray-700 text-3xl font-bold border rounded px-2 py-1 mb-4"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-green-600 mb-4">{annonce.titre}</h1>
                    )}
                </div>
                
                {/* Bouton Modifier*/}
                {isOwner && !editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="p-2 text-green-600 hover:text-green-800 transition hover:cursor-pointer"
                        title="Modifier l'annonce"
                    >
                        <SquarePen size={28} />
                    </button>
                )}
                </div>

                {editMode ? (
                    <input
                        type="number"
                        value={formData.prix || ""}
                        onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                        className="w-64 bg-white text-gray-700 text-xl border rounded px-2 py-1 mb-4"
                    />
                ) : (
                    <p className="text-xl font-semibold mb-4">{annonce.prix} €</p>
                )}
                
                <p className="text-gray-700">Publiée le {formatDateTime(annonce.date_publication)}</p>

                <div className="bg-gray-100 rounded-xl p-6 mt-8">
                    <h2 className="text-xl font-semibold text-green-600 mb-4">Description</h2>
                    {editMode ? (
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full h-32 bg-white text-gray-700 text-lg rounded px-2 py-1 mb-4"
                        />
                    ) : (
                        <p className="whitespace-pre-line">{annonce.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-100 rounded-xl p-6 mt-8">
                        <h2 className="text-xl font-semibold text-green-600 mb-4">Détails de l'annonce</h2>
                        {editMode ? (
                            <div className="space-y-4">
                                <label className="block">État :
                                    <select
                                        value={formData.etat || ""}
                                        onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                                        className="w-full bg-white text-gray-700 border rounded px-2 py-1 mt-1"
                                    >
                                        <option value="Comme neuf">Comme neuf</option>
                                        <option value="Très bon état">Très bon état</option>
                                        <option value="Bon état">Bon état</option>
                                        <option value="Usagé">Usagé</option>
                                    </select>
                                </label>
                                <label className="block">Échange possible :
                                    <input
                                        value={formData.echange_souhaite_texte || ""}
                                        onChange={(e) => setFormData({ ...formData, echange_souhaite_texte: e.target.value })}
                                        className="w-full bg-white text-gray-700 border rounded px-2 py-1 mt-1"
                                    />
                                </label>
                                <label className="block">Ville :
                                    <input
                                        value={formData.ville || ""}
                                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                        className="w-full bg-white text-gray-700 border rounded px-2 py-1 mt-1"
                                    />
                                </label>
                                <label className="block">Code Postal :
                                    <input
                                        value={formData.code_postal || ""}
                                        onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                                        className="w-full bg-white text-gray-700 border rounded px-2 py-1 mt-1"
                                    />
                                </label>
                            </div>
                        ) : ( 
                            <div className="space-y-2">
                                <p><strong>État :</strong> {annonce.etat}</p>
                                <p><strong>Échange possible contre :</strong> {annonce.echange_souhaite_texte}</p>
                                <p><strong>Ville :</strong> {annonce.ville}</p>
                                <p><strong>Code Postal :</strong> {annonce.code_postal}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-100 rounded-xl p-6 lg:mt-8">
                        <h2 className="text-xl font-semibold text-green-600 mb-4">Vendu par</h2>
                        <div>
                            <p>
                                <strong>
                                    <Link to={`/profil/${annonce?.user?.id}`} className="text-green-600 hover:underline">
                                        {annonce.user?.pseudo || "Utilisateur inconnu"}
                                    </Link>
                                </strong>
                            </p>
                            <p className="text-gray-600">Membre depuis le {formatDateTime(annonce?.user?.date_inscription)}</p>
                            <p className="text-gray-600">Dernière connexion le {formatDateTime(annonce?.user?.derniere_connexion)}</p>
                        </div>

                        {!isOwner && (
                            <div className="flex justify-end mt-4">
                                <button
                                onClick={handleContact} 
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition">
                                    Contacter
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isOwner && (
                    <div className="flex flex-col gap-4 mt-8 pt-6">
                        {editMode && (
                            <div className="flex gap-3 mx-auto">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                                >
                                    Enregistrer les modifications
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                        
                        <div className="mx-auto">
                            <button
                                onClick={handleDeleteAnnonce}
                                className="px-6 py-2 text-sm bg-red-600 font-semibold text-white rounded-lg hover:bg-red-800 transition"
                            >
                                Supprimer l’annonce
                            </button>
                        </div>
                    </div>
                )}
            </div>
    );
}
