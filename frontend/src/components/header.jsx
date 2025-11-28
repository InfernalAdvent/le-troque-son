import { useState, useEffect, useContext } from "react";
import { Menu, X, Search, User, MessageSquare, ChevronLeft, UserCircle, LogIn, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";
import api from "../api";

export default function Header() {
    const [mainCategories, setMainCategories] = useState([]);
    const [sousCategories, setSousCategories] = useState([]);
    const [filtresActifs, setFiltresActifs] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const {setUser} = useContext(AuthContext);

    const { user } = useContext(AuthContext);
    
    const location = useLocation();
    const navigate = useNavigate();

    const isAuthPage = ["/login", "/inscription", "/annonces/add"].some(path =>
        location.pathname.startsWith(path)
    );

    // Charger les catégories principales au montage
    useEffect(() => {
        const fetchMainCategories = async() => {
            try {
                const res = await api.get("/categories/main");
                setMainCategories(res.data);
            } catch (err) {
                console.error("Erreur chargement catégories :", err);
            }
        };
        fetchMainCategories();
    }, []);

    // Détecter si on est sur une page de catégorie et charger les enfants
    useEffect(() => {
        const match = location.pathname.match(/^\/categorie\/(\d+)/);
        
        if (match) {
            const categorieId = match[1];
            
            const fetchSousCategories = async() => {
                try {
                    const childrenRes = await api.get(`/categories/${categorieId}/children`);
                    
                    const categoriesAvecEnfants = await Promise.all(
                        childrenRes.data.map(async (cat) => {
                            try {
                                const enfantsRes = await api.get(`/categories/${cat.id}/children`);
                                return {
                                    ...cat,
                                    hasChildren: enfantsRes.data.length > 0
                                };
                            } catch (err) {
                                console.error(`Erreur vérification enfants catégorie ${cat.id}:`, err);
                                return { ...cat, hasChildren: false };
                            }
                        })
                    );
                    
                    setSousCategories(categoriesAvecEnfants);
                    setFiltresActifs([]);
                } catch (err) {
                    console.error("Erreur chargement sous-catégories :", err);
                }
            };
            
            fetchSousCategories();
        }
    }, [location.pathname]);

    // Fonction pour retourner à la page d'accueil
    const retourArriere = () => {
        setSousCategories([]);
        setFiltresActifs([]);
        navigate(-1);
    };

    // Toggle d'un filtre de sous-catégorie
    const toggleFiltre = (sousCatId) => {
        setFiltresActifs(prev => {
            const newFiltres = prev.includes(sousCatId)
                ? prev.filter(id => id !== sousCatId)
                : [...prev, sousCatId];
            
            // Mettre à jour l'URL avec les filtres
            const params = new URLSearchParams(location.search);
            if (newFiltres.length > 0) {
                params.set('filtres', newFiltres.join(','));
            } else {
                params.delete('filtres');
            }
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
            
            return newFiltres;
        });
    };

    // Gérer le changement de texte dans la searchbar
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Fonction pour lancer la recherche
    const handleSearch = () => {
        if (search.trim().length > 0) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
        }
    };

    // Gérer la touche Entrée
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Erreur lors de la déconnexion :", err)
        }
    };

    if (isAuthPage) {
        return (
            <header className="bg-white shadow-sm sticky top-0 z-50 py-4 px-6">
                <NavLink to="/" className="block text-center">
                    <h1 className="text-4xl font-bold text-violet-800">
                        Le Troque Son
                    </h1>
                </NavLink>
            </header>
        );
    }

    return (
        <header className="bg-violet-100 shadow-sm sticky top-0 z-50">
            {/* Partie supérieure : Logo + Searchbar */}
            <div className="border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between py-4 gap-6">
                        <NavLink to="/" className="shrink-0">
                            <h1 className="text-2xl font-bold text-violet-800 whitespace-nowrap">
                                Le Troque Son
                            </h1>
                        </NavLink>

                        {user ? (
                            <NavLink
                                to="/annonces/add"
                                className="bg-violet-600 hover:bg-violet-800 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors">
                                Déposer une annonce
                            </NavLink>

                        ): (
                            <NavLink
                                to="/login"
                                className="bg-violet-600 hover:bg-violet-800 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors">
                                Déposer une annonce
                            </NavLink>
                        )}
                        

                        <div className="flex-1 max-w-2xl relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher une annonce..."
                                    className="w-full border-2 border-violet-600 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-violet-800"
                                    value={search}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleKeyPress}
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-800 text-white p-2 rounded-md"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            {user ? (
                                <NavLink 
                                    to="/compte" 
                                    className="text-violet-600 hover:text-violet-800 transition-colors p-2"
                                    title="compte"
                                >
                                    <UserCircle size={24} />
                                </NavLink>
                            ) : (

                                <NavLink 
                                    to="/login" 
                                    className="text-violet-600 hover:text-violet-800 transition-colors p-2"
                                    title="Connexion"
                                >
                                    <LogIn size={24} />
                                </NavLink>

                            )}
                                  
                            <NavLink 
                                to="/messages" 
                                className="text-violet-600 hover:text-violet-800 transition-colors p-2"
                                title="Messages"
                            >
                                <MessageSquare size={24} />

                            </NavLink>
                            {user && ( 
                                <button 
                                    onClick={handleLogout} 
                                    className="text-violet-600 hover:text-violet-800 transition-colors p-2"
                                    title="Déconnexion"
                                >
                                    <LogOut size={24} />
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Mobile & Tablet Layout */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between py-3">
                            <NavLink to="/" className="flex-1 text-center">
                                <h1 className="text-xl font-bold text-violet-800">
                                    Le Troque Son
                                </h1>
                            </NavLink>
                            
                            <button 
                                className="p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X size={24} className="text-violet-600" />
                                ) : (
                                    <Menu size={24} className="text-violet-600" />
                                )}
                            </button>
                        </div>

                        <div className="pb-3 relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full border-2 border-violet-600 rounded-lg py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-violet-700"
                                    value={search}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleKeyPress}
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-800 text-white p-1.5 rounded-md"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navbar des catégories - Dynamique */}
            <nav className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-2 md:gap-6 py-3 overflow-x-auto">
                        {sousCategories.length > 0 ? (
                            <>
                                <button
                                    onClick={retourArriere}
                                    className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-800 whitespace-nowrap"
                                >
                                    <ChevronLeft size={18} />
                                    <span>Retour</span>
                                </button>
                                
                                <span className="text-gray-400">|</span>

                                {sousCategories.map((sousCat) => (
                                    sousCat.hasChildren ? (
                                        <NavLink
                                            key={sousCat.id}
                                            to={`/categorie/${sousCat.id}`}
                                            className="text-sm text-violet-600 font-medium transition-colors hover:text-violet-800 whitespace-nowrap"
                                        >
                                            {sousCat.nom}
                                        </NavLink>
                                    ) : (
                                        <button
                                            key={sousCat.id}
                                            onClick={() => toggleFiltre(sousCat.id)}
                                            className={`text-sm font-medium transition-all whitespace-nowrap px-3 py-1.5 rounded-md ${
                                                filtresActifs.includes(sousCat.id)
                                                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                                                    : 'text-violet-600'
                                            }`}
                                        >
                                            {sousCat.nom}
                                        </button>
                                    )
                                ))}
                            </>
                        ) : (
                            mainCategories.map((cat) => (
                                <NavLink
                                    key={cat.id}
                                    to={`/categorie/${cat.id}`}
                                    className="text-sm text-violet-600 font-medium transition-colors hover:text-violet-800 whitespace-nowrap"
                                >
                                    {cat.nom}
                                </NavLink>
                            ))
                        )}
                    </div>
                </div>
            </nav>

            {/* Menu Mobile déroulant */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <nav className="max-w-7xl mx-auto px-4 py-4">
                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                            {user ? (
                                <NavLink
                                    to="/compte"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-violet-100 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User size={20} className="text-violet-800" />
                                    <span className="font-medium">Mon Compte</span>
                                </NavLink>
                            ) : (
                                <NavLink
                                    to="/login"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-violet-100 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User size={20} className="text-violet-800" />
                                    <span className="font-medium">Connexion / Inscription</span>
                                </NavLink>
                            )}

                            <NavLink
                                to="/messages"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-violet-100 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <MessageSquare size={20} className="text-violet-800" />
                                <span className="font-medium">Messages</span>
                            </NavLink>

                            {user && (
                                <button
                                onClick={handleLogout}
                                className="w-full flex items-center text-left gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-violet-100 transition-colors"
                                title="Déconnexion">
                                <LogOut size={20} className="text-violet-800" />
                                <span className="font-medium">Déconnexion</span>
                                </button>
                            )}

                        </div>

                        <button className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Déposer une annonce
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}