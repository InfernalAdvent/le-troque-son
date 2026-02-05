import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Annonce() {
    const { id } = useParams();

    const [annonce, setAnnonce] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mainSwiperRef = useRef(null);

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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

    if (loading) return <p className="text-center mt-10">Chargement...</p>;
    if (!annonce) return <p className="text-center mt-10">Annonce introuvable</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="mb-4">
                {photos.length === 0 ? (
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        Aucune photo
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
                        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
                            {photos
                                .sort((a, b) => a.ordre - b.ordre)
                                .map((photo, index) => (
                                    <img
                                        key={photo.id}
                                        src={`${import.meta.env.VITE_API_URL}${photo.url}`}
                                        alt="miniature"
                                        className={`h-20 w-20 object-cover rounded-lg cursor-pointer border-2 ${
                                            selectedPhotoIndex === index
                                                ? "border-violet-700"
                                                : "border-transparent"
                                        }`}
                                        onClick={() => {
                                            mainSwiperRef.current.slideTo(index);
                                            setSelectedPhotoIndex(index);
                                        }}
                                    />
                                ))}
                        </div>

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

            <h1 className="text-3xl font-bold text-violet-800 mb-4">{annonce.titre}</h1>
            <p className="text-xl font-semibold mb-4">{annonce.prix} €</p>
            <p className="text-gray-500">Publiée le {formatDateTime(annonce.date_publication)}</p>

            <div className="bg-gray-100 rounded-xl p-6 mt-8">
                <h2 className="text-xl font-semibold text-violet-800 mb-4">Description</h2>
                <p>{annonce.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-xl p-6 mt-8">
                    <h2 className="text-xl font-semibold text-violet-800 mb-4">Détails de l'annonce</h2>
                    <p><strong>État </strong>{annonce.etat}</p>
                    <p><strong>Échange possible contre </strong>{annonce.echange_souhaite_texte}</p>
                    <p><strong>Ville </strong>{annonce.ville}</p>
                    <p><strong>Code Postal </strong>{annonce.code_postal}</p>
                </div>

                <div className="bg-gray-100 rounded-xl p-6 lg:mt-8">
                    <h2 className="text-xl font-semibold text-violet-800 mb-4">Vendu par</h2>
                    <p><strong>{annonce.user?.pseudo}</strong></p>
                    <p>Membre depuis {formatDateTime(annonce.user?.date_inscription)}</p>
                    <p>Dernière connexion le {formatDateTime(annonce.user?.derniere_connexion)}</p>
                </div>
            </div>
        </div>
    );
}
