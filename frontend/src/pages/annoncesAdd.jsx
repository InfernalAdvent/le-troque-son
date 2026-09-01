import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CityAutocomplete from "../components/cityAutocomplete";
import { useDragAndDrop } from "../components/useDragAndDrop";
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
    departement_numero: "",
  });

  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [villeValide, setVilleValide] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
    [], // pas de photos "existantes" en mode création
    photos,
    (reordered) => setPhotos(reordered),
  );

  // Gérer l'ajout de photos
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (photos.length + files.length > 5) {
      setError("Maximum 5 photos autorisées");
      return;
    }

    const newPhotosObjs = files.map((f) => ({
      id: `new-${Date.now()}-${f.name}`,
      file: f,
      url: URL.createObjectURL(f),
    }));

    setPhotos((prev) => [...prev, ...newPhotosObjs]);
    setError("");
  };

  // Supprimer une photo
  const removePhoto = (id) => {
    setPhotos((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (Number(formData.prix) < 0) {
      setError("Le prix ne peut pas être négatif");
      setLoading(false);
      return;
    }

    if (formData.description && formData.description.length < 10) {
      setError("La description doit comporter au moins 10 caractères");
      setLoading(false);
      return;
    } else if (formData.description && formData.description.length > 2000) {
      setError("La description ne doit pas dépasser 2000 caractères");
      setLoading(false);
      return;
    }

    if (
      formData.echange_souhaite_texte &&
      formData.echange_souhaite_texte.length > 50
    ) {
      setError(
        "Le texte des échanges possibles ne doit pas dépasser 50 caractères",
      );
      setLoading(false);
      return;
    }

    if (!villeValide) {
      setError("Veuillez sélectionner une ville dans la liste.");
      setLoading(false);
      return;
    }

    if (!formData.code_postal) {
      setError("Veuillez sélectionner une ville valide.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/annonces", formData);
      const annonceId = res.data.id;

      if (photos.length > 0) {
        const formPhotos = new FormData();
        photos.forEach((p) => formPhotos.append("photos", p.file));
        formPhotos.append("annonce_id", annonceId);

        await api.post("/photos/upload", formPhotos, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      photos.forEach((p) => URL.revokeObjectURL(p.url));
      navigate("/mon-profil");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'annonce",
      );
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (categories) => {
    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      cat.enfants = [];
      map[cat.id] = cat;
    });

    categories.forEach((cat) => {
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
    return cats.flatMap((cat) => {
      const prefix = "\u00A0".repeat(level * 4);
      if (cat.enfants.length === 0) {
        return (
          <option key={cat.id} value={cat.id}>
            {prefix}
            {cat.nom}
          </option>
        );
      } else {
        return [
          <option key={cat.id} value="" disabled>
            {prefix}
            {cat.nom}
          </option>,
          ...renderOptions(cat.enfants, level + 1),
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
    <div className="flex justify-center items-center min-h-screen pt-12">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl text-green-600 font-bold mb-6">
          Poster une annonce
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Nom de l'annonce
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Zone de photos */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Photos ({photos.length}/5)
            </label>

            <div className="grid grid-cols-5 gap-3 mb-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="relative aspect-square cursor-move"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-green-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-green-50">
                  <svg
                    className="w-8 h-8 text-gray-400 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-xs text-gray-500 text-center px-2">
                    Ajouter
                  </span>
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
            <label className="block font-semibold text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              name="categorie_id"
              value={formData.categorie_id}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {renderOptions(categories)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              rows="4"
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Prix (€)
            </label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Échanges possibles
            </label>
            <input
              type="text"
              name="echange_souhaite_texte"
              value={formData.echange_souhaite_texte}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Ex: Contre une basse, un ampli..."
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              État
            </label>
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            >
              <option value="">Sélectionner</option>
              <option value="Comme neuf">Comme neuf</option>
              <option value="Très bon état">Très bon état</option>
              <option value="Bon état">Bon état</option>
              <option value="Usagé">Usagé</option>
            </select>
          </div>

          <input
            type="hidden"
            name="departement_numero"
            value={formData.departement_numero}
          />

          <CityAutocomplete
            ville={formData.ville}
            codePostal={formData.code_postal}
            setVille={(v) => setFormData((prev) => ({ ...prev, ville: v }))}
            setCodePostal={(cp) =>
              setFormData((prev) => ({ ...prev, code_postal: cp }))
            }
            setDepartement={(d) =>
              setFormData((prev) => ({ ...prev, departement_numero: d }))
            }
            setVilleValide={setVilleValide}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-800 text-white p-3 rounded-lg font-semibold transition disabled:bg-gray-400"
          >
            {loading ? "Publication..." : "Publier l'annonce"}
          </button>
        </form>
      </div>
    </div>
  );
}
