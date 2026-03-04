import { NavLink } from "react-router-dom";


export default function Footer() {
        
    return (
            <footer className="bg-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1),0_-4px_6px_-4px_rgba(0,0,0,0.1)] mt-20">            <div className="max-w-5xl mx-auto px-4 py-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <li className="text-center">
                        <NavLink className="text-gray-700  hover:underline" to="/construction">
                            À propos du Troque Son
                        </NavLink>
                    </li>
                    <li className="text-center">
                        <NavLink className="text-gray-700  hover:underline" to="/construction">
                            Mentions légales
                        </NavLink>
                    </li>
                    <li className="text-center">
                        <NavLink className="text-gray-700  hover:underline" to="/construction">
                            Accessibilité
                        </NavLink>
                    </li>
                    <li className="text-center">
                        <NavLink className="text-gray-700  hover:underline" to="/construction">
                            Aide & Sécurité
                        </NavLink>
                    </li>
                </ul>

                <div className="text-center border-t border-gray-700 pt-4">
                    <p className="text-gray-700">©Le Troque Son 2026</p>
                </div>
            </div>
        </footer>
    );
}