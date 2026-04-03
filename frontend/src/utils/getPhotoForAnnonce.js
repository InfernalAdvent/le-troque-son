/**
 * Trouve la photo principale d'une annonce (ordre 0), ou la première photo disponible.
 * @param {Array} photos - Le tableau annonce.photos embarqué dans la réponse
 */
export function getPhotoForAnnonce(photos) {
    if (!photos || photos.length === 0) return null;
    return photos.find(photo => photo.ordre === 0) || photos[0];
}
