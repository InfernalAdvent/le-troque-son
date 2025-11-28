import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
            const prefix = "\u00A0".repeat(level * 4); // indentation
            if (cat.enfants.length === 0) {
                // catégorie enfant cliquable
                return (
                    <option key={cat.id} value={cat.id}>
                        {prefix}{cat.nom}
                    </option>
                );
            } else {
                // catégorie parent grisée + afficher enfants récursivement
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
        fetchCategories();
    }, []);

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

                <div>
                    <label className="block font-semibold mb-1">Photos (max 5)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length > 5) {
                                setError("Maximum 5 photos");
                                return;
                            }
                            setUploadedPhotos(files);
                        }}
                        className="w-full"
                    />
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
                    <label className="block font-semibold mb-1">Prix</label>
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
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">État</label>
                    <select
                        name="etat"
                        value={formData.etat}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
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
                    <input
                        type="text"
                        name="departement_numero"
                        value={formData.departement_numero}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                    />
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
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Code postal</label>
                        <input
                            type="number"
                            name="code_postal"
                            value={formData.code_postal}
                            onChange={handleChange}
                            className="w-full p-3 border rounded"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-lg font-semibold transition"
                >
                    {loading ? "Publication..." : "Publier l'annonce"}
                </button>
            </form>
        </div>
    );
}
