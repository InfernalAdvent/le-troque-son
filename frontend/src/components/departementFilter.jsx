import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import api from "../api";

export default function DepartementFilter() {
  const [departements, setDepartements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const res = await api.get("/departements");
        setDepartements(res.data);
      } catch (err) {
        console.error("Erreur chargement départements", err);
      }
    };
    fetchDepartements();
  }, []);

  const toggleDepartement = (numero) => {
    const params = new URLSearchParams(location.search);
    const currentSelected = params.get("departements")?.split(",") || [];

    const next = currentSelected.includes(numero)
      ? currentSelected.filter(n => n !== numero)
      : [...currentSelected, numero];

    if (next.length === 0) {
      params.delete("departements");
    } else {
      params.set("departements", next.join(","));
    }

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    setSearchTerm(""); // Réinitialiser la recherche après sélection
  };

  const removeDepartement = (numero) => {
    toggleDepartement(numero);
  };

  const selectedDeps = new URLSearchParams(location.search).get("departements")?.split(",") || [];
  
  // Filtrer les départements selon la recherche
  const filteredDepartements = departements
    .filter(dep => dep && dep.numero && dep.nom)
    .filter(dep => 
      !selectedDeps.includes(dep.numero) && // Ne pas afficher les déjà sélectionnés
      (dep.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
       dep.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const selectedDepartements = departements.filter(dep => selectedDeps.includes(dep.numero));

 

  return (
    <div className="mb-6">
      <div className="max-w-100 mx-auto sm:mx-0">
        <div className="flex flex-col gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un département..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpen(e.target.value.length > 0);
              }}
              onFocus={() => setOpen(true)}
              className="w-full px-4 py-2 border-2 border-green-600 text-sm rounded-lg focus:outline-none"
            />
            
            {/* Liste déroulante des suggestions */}
            {open && searchTerm && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {filteredDepartements.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    Aucun département trouvé
                  </div>
                ) : (
                  filteredDepartements.map(dep => (
                    <button
                      key={dep.numero}
                      onClick={() => toggleDepartement(dep.numero)}
                      className="w-full text-left px-4 py-2 hover:bg-green-100 transition-colors text-sm"
                    >
                      <span className="font-medium text-green-600">{dep.numero}</span>
                      {" – "}
                      <span>{dep.nom}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Départements sélectionnés */}
          {selectedDepartements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedDepartements.map(dep => (
                <div
                  key={dep.numero}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{dep.numero} – {dep.nom}</span>
                  <button
                    onClick={() => removeDepartement(dep.numero)}
                    className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}