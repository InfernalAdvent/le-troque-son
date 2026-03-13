import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import Login from './pages/login';
import SignUp from './pages/signup';
import Annonce from './pages/annonce';
import AnnoncesCard from './components/annoncesCard';
import AnnoncesAdd from './pages/annoncesAdd';
import DepartementFilter from "./components/departementFilter";
import UserProfile from './pages/userProfile';
import Messages from './pages/messages';
import NotFound from './pages/404';
import Construction from './pages/construction';
import api from './api';
import { useEffect, useState } from 'react';

function Home() {
  const [annonces, setAnnonces] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
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
        if (queryParams.length > 0) url += "?" + queryParams.join("&");

        const annoncesRes = await api.get(url);
        const photosRes = await api.get("/photos");
        setAnnonces(annoncesRes.data);
        setPhotos(photosRes.data);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);


  const totalPages = Math.ceil(annonces.length / itemsPerPage);
  const paginatedAnnonces = annonces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPhotoForAnnonce = (annonceId) => {
    return photos.find(photo => photo.annonce_id === annonceId && photo.ordre === 0)
      || photos.find(photo => photo.annonce_id === annonceId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Chargement des annonces...</p>
      </div>
    );
  }

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-black text-left mb-4'>
        {searchQuery ? `Résultats pour "${searchQuery}"` : 'En ce moment sur Le Troque Son'}
      </h1>

      <p className="text-gray-700 mb-4">
        {annonces.length} annonce{annonces.length > 1 ? 's' : ''} trouvée{annonces.length > 1 ? 's' : ''}
      </p>

      <DepartementFilter />

      {annonces.length === 0 ? (
        <p className="text-gray-600 text-center py-12">Aucune annonce disponible pour le moment.</p>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8'>
            {paginatedAnnonces.map((annonce) => (
              <AnnoncesCard
                key={annonce.id}
                annonce={annonce}
                photo={getPhotoForAnnonce(annonce.id)}
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-end gap-4 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Afficher :</span>
              {[25, 50, 100].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    itemsPerPage === n
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 hover:border-green-600 hover:text-green-600 cursor-pointer'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-green-600 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        currentPage === p
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:border-green-600 hover:text-green-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))
                }

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-green-600 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </>
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
        const catRes = await api.get(`/categories/${id}`);
        setCategorie(catRes.data);

        const params = new URLSearchParams(location.search);
        const filtresParam = params.get('filtres');
        const departementsParam = params.get('departements');

        let url = `/annonces/categorie/${id}`;
        const queryParams = [];
        if (departementsParam) queryParams.push(`departements=${departementsParam}`);
        if (filtresParam) queryParams.push(`filtres=${filtresParam}`);
        if (queryParams.length > 0) url += "?" + queryParams.join("&");

        const annoncesRes = await api.get(url);
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
    return photos.find(photo => photo.annonce_id === annonceId && photo.ordre === 0)
      || photos.find(photo => photo.annonce_id === annonceId);
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
      <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-black text-left mb-4'>
        {categorie?.nom}
      </h1>

      <p className="text-gray-600 mb-8">
        {annonces.length} annonce{annonces.length > 1 ? 's' : ''} trouvée{annonces.length > 1 ? 's' : ''}
      </p>

      <DepartementFilter />

      {annonces.length === 0 ? (
        <p className="text-gray-700 text-center py-12">Aucune annonce dans cette catégorie.</p>
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className='flex-1'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorie/:id" element={<CategorieAnnonces />} />
          <Route path="/annonces/:id" element={<Annonce/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<SignUp />} />
          <Route path="/compte" element={<UserProfile key="own-profile" />} />
          <Route path="/profil/:id" element={<UserProfile />} />
          <Route path="/annonces/add" element={<AnnoncesAdd />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;