import { NavLink } from "react-router-dom";

export default function AnnoncesCard({ annonce, photo }) {
    return(
        <NavLink 
            to={`/annonces/${annonce.id}`}
            className="border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 w-full max-w-xs flex flex-col gap-3 bg-white mx-auto"
        >
            {/* Image de l'annonce */}
            <div className="h-48 w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {photo ? (
                    <img 
                        src={photo.url.startsWith("/uploads")
                            ? `http://localhost:5000${photo.url}` 
                            : photo.url
                        }
                         
                        alt={annonce.titre}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-gray-400">Pas d'image</span>
                )}
            </div>

            {/* Informations de l'annonce */}
            <h3 className="text-xl font-bold text-violet-800 line-clamp-2">
                {annonce.titre}
            </h3>
            
            <p className="text-2xl font-bold text-violet-800">
                {annonce.prix} €
            </p>
            
            <div className="text-sm text-gray-600">
                <p>{annonce.ville}</p>
                <p>{annonce.code_postal}</p>
            </div>
        </NavLink>
    );
}