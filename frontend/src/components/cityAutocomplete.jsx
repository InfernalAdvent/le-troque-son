// components/CityAutocomplete.jsx
import { useState } from "react";

export default function CityAutocomplete({ 
    ville, 
    codePostal, 
    setVille, 
    setCodePostal, 
    setDepartement,
    setVilleValide,
    required = false 
}) {
    const [villesSuggestions, setVillesSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingVilles, setLoadingVilles] = useState(false);
    const [codesPostauxDisponibles, setCodesPostauxDisponibles] = useState([]);

    const handleVilleChange = async (e) => {
        const value = e.target.value;
        setVille(value);
        setVilleValide?.(false);

        if (value.length >= 3) {
            setLoadingVilles(true);
            try {
                const res = await fetch(
                    `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(value)}&fields=nom,codesPostaux,codeDepartement&limit=10`
                );
                const data = await res.json();
                setVillesSuggestions(data);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Erreur API Geo:", err);
            } finally {
                setLoadingVilles(false);
            }
        } else {
            setVillesSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectVille = (villeObj) => {
        setVille(villeObj.nom);
        setDepartement(villeObj.codeDepartement);
        setCodesPostauxDisponibles(villeObj.codesPostaux);
        setCodePostal(villeObj.codesPostaux.length === 1 ? villeObj.codesPostaux[0] : "");
        setVilleValide?.(true);
        setShowSuggestions(false);
        setVillesSuggestions([]);
    };

    const handleCodePostalChange = (e) => {
        setCodePostal(e.target.value);
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <label className="block font-semibold mb-1">Ville</label>
                <input
                    value={ville || ""}
                    onChange={handleVilleChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full p-3 border rounded"
                    placeholder="Ex: Marseille"
                    required={required}
                    autoComplete="off"
                />

                {showSuggestions && villesSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {loadingVilles ? (
                            <li className="p-3 text-gray-500">Chargement...</li>
                        ) : (
                            villesSuggestions.map((villeObj, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectVille(villeObj)}
                                    className="p-3 hover:bg-green-100 cursor-pointer border-b last:border-b-0"
                                >
                                    <div className="font-medium">{villeObj.nom}</div>
                                    <div className="text-sm text-gray-500">
                                        {villeObj.codesPostaux.join(", ")}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>

            <div>
                <label className="block font-semibold mb-1">Code postal</label>
                {codesPostauxDisponibles.length > 1 ? (
                    <select
                        value={codePostal || ""}
                        onChange={handleCodePostalChange}
                        className="w-full p-3 border rounded"
                        required={required}
                    >
                        <option value="">Choisir un code postal</option>
                        {codesPostauxDisponibles.map((cp) => (
                            <option key={cp} value={cp}>{cp}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        value={codePostal || ""}
                        className="w-full p-3 border rounded"
                        readOnly
                        required={required}
                    />
                )}
            </div>
        </div>
    );
}