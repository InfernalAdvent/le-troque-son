import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function DepartementFilter() {
  const { id } = useParams();
  const [departements, setDepartements] = useState([]);
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const hiddenOn = ["/login", "/inscription", "/annonces/add", "/compte", `/annonces/${id}`];
  
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
  };

  const selected = new URLSearchParams(location.search).get("departements")?.split(",") || [];

  if (hiddenOn.includes(location.pathname)) return null;

  return (
    <div className="bg-gray-50 shadow-md mb-6">
      {/* Header de l'accordéon centré */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 font-semibold text-violet-600 flex justify-center items-center gap-2"
      >
        <span>Filtrer par département</span>
        <span
          className={`transform transition-transform duration-500 ease-in-out ${open ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </span>
      </button>

      {/* Contenu déroulant */}
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {departements.map(dep => (
            <label key={dep.numero} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(dep.numero)}
                onChange={() => toggleDepartement(dep.numero)}
              />
              <span>{dep.numero} – {dep.nom}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
