import NotFoundImage from '../assets/404.png'

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto p-8 rounded-xl flex flex-col items-center gap-8">
      <img
        src={NotFoundImage}
        alt="pictogramme d'erreur 404"
        className="w-1/2 h-auto object-cover"
      />
      <p className="text-lg text-gray-700">
        Oups, cette page n'existe pas.
      </p>
    </div>
  );
}
