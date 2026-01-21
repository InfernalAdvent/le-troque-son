import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react"; // Pour l'icône de suppression
import api from "../api";

export default function AnnoncesAdd() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        titre: "",
        categorie_id: "",
        description: "",
        prix: "",
        etat: "",
        echange_souhaite_texte: "",
        ville: "",
        code_postal: "",
        statut: "",
        departement_numero: ""
    });

    const [categories, setCategories] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Gérer l'ajout de photos
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        setUploadedPhotos(prev => {
            if (prev.length + files.length > 5) {
                setError("Maximum 5 photos autorisées");
                return prev;
            }
            return [...prev, ...files];
        });

        setPreviewUrls(prev => {
            const newUrls = files.map(file => URL.createObjectURL(file));
            return [...prev, ...newUrls];
        });

        setError("");
    };


    // Supprimer une photo
    const removePhoto = (index) => {
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });

        setUploadedPhotos(prev =>
            prev.filter((_, i) => i !== index)
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/annonces", formData);
            const annonceId = res.data.id;

            if (uploadedPhotos.length > 0) {
                const formPhotos = new FormData();
                uploadedPhotos.forEach(file => formPhotos.append("photos", file));
                formPhotos.append("annonce_id", annonceId);

                await api.post("/photos/upload", formPhotos, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            // Nettoyer les URLs de prévisualisation
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            navigate("/compte");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la création de l'annonce");
        } finally {
            setLoading(false);
        }
    };

    // Construire un arbre hiérarchique pour le select
    const buildTree = (categories) => {
        const map = {};
        const roots = [];

        categories.forEach(cat => {
            cat.enfants = [];
            map[cat.id] = cat;
        });

        categories.forEach(cat => {
            if (cat.parent_id) {
                if (map[cat.parent_id]) {
                    map[cat.parent_id].enfants.push(cat);
                }
            } else {
                roots.push(cat);
            }
        });

        return roots;
    };

    const renderOptions = (cats, level = 0) => {
        return cats.flatMap(cat => {
            const prefix = "\u00A0".repeat(level * 4);
            if (cat.enfants.length === 0) {
                return (
                    <option key={cat.id} value={cat.id}>
                        {prefix}{cat.nom}
                    </option>
                );
            } else {
                return [
                    <option key={cat.id} value="" disabled>
                        {prefix}{cat.nom}
                    </option>,
                    ...renderOptions(cat.enfants, level + 1)
                ];
            }
        });
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                const tree = buildTree(res.data);
                setCategories(tree);
            } catch (err) {
                console.error("Erreur chargement catégories:", err);
            }
        };

        const fetchDepartements = async () => {
        try {
            const res = await api.get("/departements");
            setDepartements(res.data);
        } catch (err) {
            console.error("Erreur chargement départements:", err);
        }
    };

        fetchCategories();
        fetchDepartements();
    }, []);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // obligatoire pour autoriser le drop
    };

    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const newPhotos = [...uploadedPhotos];
        const newPreviews = [...previewUrls];

        // swap
        const draggedPhoto = newPhotos[draggedIndex];
        const draggedPreview = newPreviews[draggedIndex];

        newPhotos.splice(draggedIndex, 1);
        newPreviews.splice(draggedIndex, 1);

        newPhotos.splice(index, 0, draggedPhoto);
        newPreviews.splice(index, 0, draggedPreview);

        setUploadedPhotos(newPhotos);
        setPreviewUrls(newPreviews);
        setDraggedIndex(null);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl text-violet-800 font-bold mb-6">Poster une annonce</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

                <div>
                    <label className="block font-semibold mb-1">Titre</label>
                    <input
                        type="text"
                        name="titre"
                        value={formData.titre}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                {/* Zone de photos améliorée */}
                <div>
                    <label className="block font-semibold mb-2">Photos ({uploadedPhotos.length}/5)</label>
                    
                    {/* Grille de prévisualisation */}
                    <div className="grid grid-cols-5 gap-3 mb-3">
                        {/* Vignettes des photos uploadées */}
                        {previewUrls.map((url, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className="relative aspect-square cursor-move"
                            >
                                <img
                                    src={url}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                />

                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>

                                {/* Indice visuel */}
                                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                        
                        {/* Bouton d'ajout si moins de 5 photos */}
                        {uploadedPhotos.length < 5 && (
                            <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-violet-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100">
                                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs text-gray-500 text-center px-2">Ajouter</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    
                    <p className="text-sm text-gray-500">
                        Formats acceptés : JPG, PNG. Maximum 5 photos.
                    </p>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Catégorie</label>
                    <select
                        name="categorie_id"
                        value={formData.categorie_id}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {renderOptions(categories)}
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        rows="4"
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Prix (€)</label>
                    <input
                        type="number"
                        name="prix"
                        value={formData.prix}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Échanges possibles</label>
                    <input
                        type="text"
                        name="echange_souhaite_texte"
                        value={formData.echange_souhaite_texte}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        placeholder="Ex: Contre une basse, un ampli..."
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">État</label>
                    <select
                        name="etat"
                        value={formData.etat}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    >
                        <option value="">Sélectionner</option>
                        <option value="neuf">Neuf</option>
                        <option value="comme neuf">Comme neuf</option>
                        <option value="bon">Bon</option>
                        <option value="usagé">Usagé</option>
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Département</label>
                    <select
                        name="departement_numero"
                        value={formData.departement_numero}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    >
                        <option value="">Sélectionner un département</option>
                        {departements.map(dep => (
                            <option key={dep.id} value={dep.numero}>
                                {dep.numero} - {dep.nom}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-1">Ville</label>
                        <input
                            type="text"
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            className="w-full p-3 border rounded"
                            placeholder="Ex: Marseille"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Code postal</label>
                        <input
                            type="text"
                            name="code_postal"
                            value={formData.code_postal}
                            onChange={handleChange}
                            className="w-full p-3 border rounded"
                            placeholder="Ex: 13001"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-lg font-semibold transition disabled:bg-gray-400"
                >
                    {loading ? "Publication..." : "Publier l'annonce"}
                </button>
            </form>
        </div>
    );
}