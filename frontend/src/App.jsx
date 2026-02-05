import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import Header from './components/header';
import Login from './pages/login';
import SignUp from './pages/signup';
import Compte from './pages/account';
import Annonce from './pages/annonce';
import AnnoncesCard from './components/annoncesCard';
import AnnoncesAdd from './pages/annoncesAdd';
import DepartementFilter from "./components/departementFilter";
import api from './api';
import { useEffect, useState } from 'react';

function Home() {
  const [annonces, setAnnonces] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
        const departements = params.get('departements');

        let url = "/annonces";
        const queryParams = [];

        if (searchQuery) queryParams.push(`search=${searchQuery}`);
        if (departements) queryParams.push(`departements=${departements}`);

        if (queryParams.length > 0) {
          url += "?" + queryParams.join("&");
        }

        const annoncesRes = await api.get(url);
        const photosRes = await api.get("/photos");

        setAnnonces(annoncesRes.data);
        setPhotos(photosRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);


  const getPhotoForAnnonce = (annonceId) => {
    return photos.find(photo => photo.annonce_id === annonceId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Chargement des annonces...</p>
      </div>
    );
  }

  // Récupérer le terme de recherche pour l'afficher
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-violet-800 text-left mb-4'>
        {searchQuery ? `Résultats pour "${searchQuery}"` : 'En ce moment sur Le Troque Son'}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {annonces.length} annonce{annonces.length > 1 ? 's' : ''} trouvée{annonces.length > 1 ? 's' : ''}
      </p>
      
      {annonces.length === 0 ? (
        <p className="text-gray-600 text-center py-12">Aucune annonce disponible pour le moment.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8'>
          {annonces.map((annonce) => (
            <AnnoncesCard 
              key={annonce.id}
              annonce={annonce}
              photo={getPhotoForAnnonce(annonce.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorieAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState(null);
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les infos de la catégorie
        const catRes = await api.get(`/categories/${id}`);
        setCategorie(catRes.data);
        
        // Récupérer les annonces de la catégorie
        let annoncesRes = await api.get(`/annonces/categorie/${id}`);
        
        // Récupérer les filtres depuis l'URL
        const params = new URLSearchParams(location.search);
        const filtresParam = params.get('filtres');
        
        // Si des filtres sont actifs, filtrer les annonces
        if (filtresParam) {
          const filtresIds = filtresParam.split(',').map(Number);
          annoncesRes.data = annoncesRes.data.filter(annonce => 
            filtresIds.includes(annonce.categorie_id)
          );
        }
        
        // Charger les photos
        const photosRes = await api.get("/photos");
        
        setAnnonces(annoncesRes.data);
        setPhotos(photosRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, location.search]);

  const getPhotoForAnnonce = (annonceId) => {
    return photos.find(photo => photo.annonce_id === annonceId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Chargement des annonces...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-violet-800 text-left mb-4'>
        {categorie?.nom}
      </h1>

      
      <p className="text-gray-600 mb-8">
        {annonces.length} annonce{annonces.length > 1 ? 's' : ''} trouvée{annonces.length > 1 ? 's' : ''}
      </p>
      
      {annonces.length === 0 ? (
        <p className="text-gray-600 text-center py-12">Aucune annonce dans cette catégorie.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {annonces.map((annonce) => (
            <AnnoncesCard 
              key={annonce.id}
              annonce={annonce}
              photo={getPhotoForAnnonce(annonce.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-violet-200">
      <Header />

      <DepartementFilter />
      
      <main className='flex-1'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorie/:id" element={<CategorieAnnonces />} />
          <Route path="/annonces/:id" element={<Annonce/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<SignUp />} />
          <Route path="/compte" element={<Compte />} />
          <Route path="/annonces/add" element={<AnnoncesAdd />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;