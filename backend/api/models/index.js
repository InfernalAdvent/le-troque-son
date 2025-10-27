const Annonce = require('./annonce');
const Categorie = require('./categorie');
const Conversation = require('./conversation');
const Departement = require('./departement');
const Message = require('./message');
const Photo = require('./photo');
const User = require('./user');
const Wishlist = require('./wishlist');


Annonce.belongsTo(User, { foreignKey: 'utilisateur_id' });
Annonce.belongsTo(Categorie, { foreignKey: 'categorie_id' });
Annonce.belongsTo(Categorie, { foreignKey: 'echange_categorie_id', as: 'echangeCategorie' });
Annonce.belongsTo(Departement, { foreignKey: 'departement_id' });


Categorie.belongsTo(Categorie, { foreignKey: 'parent_id', as: 'parent' });


Conversation.belongsTo(Annonce, { foreignKey: 'annonce_id' });
Conversation.belongsTo(User, { foreignKey: 'utilisateur_initiateur_id', as: 'initiateur' });
Conversation.belongsTo(User, { foreignKey: 'utilisateur_receveur_id', as: 'receveur' });


Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { foreignKey: 'expediteur_id', as: 'expediteur' });


Photo.belongsTo(Annonce, { foreignKey: 'annonce_id' });
Photo.belongsTo(Wishlist, { foreignKey: 'wishlist_id' });


User.belongsTo(Departement, { foreignKey: 'departement_id' });


Wishlist.belongsTo(User, { foreignKey: 'user_id' });
Wishlist.belongsTo(Categorie, { foreignKey: 'categorie_id' });


module.exports = {
    Annonce,
    Categorie,
    Conversation,
    Departement,
    Message,
    Photo,
    User,
    Wishlist
};
