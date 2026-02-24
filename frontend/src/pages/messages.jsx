import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AuthContext } from "../components/authContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export default function Messages() {
    const { user, loadingAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const messageEndRef =  useRef(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView();
    }

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    };

    const handleSelectConversation = useCallback(async (conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);

        try {
            const res = await api.get(`/conversations/${conversation.id}/messages`);
            setMessages(res.data);

            setConversations(prev =>
                prev.map(c =>
                    c.id === conversation.id
                        ? { ...c, hasUnread: false }
                        : c
                )
            );

            setTimeout(scrollToBottom, 50);
        } catch (err) {
            console.error("Erreur chargement messages:", err);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const res = await api.post(`/conversations/${selectedConversation.id}/messages`, {
                contenu: newMessage.trim()
            });

            setMessages(prev => [...prev, res.data]);
            setNewMessage("");

            setConversations(prev =>
                prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, date_derniere_activite: new Date().toISOString(),
                            messages: [res.data]
                         }
                        : c
                ).sort((a, b) =>
                    new Date(b.date_derniere_activite) - new Date(a.date_derniere_activite)
                )
            );

            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error("Erreur envoi message:", err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInterlocuteur = (conversation) => {
        return conversation.initiateur?.id === user?.id
            ? conversation.receveur
            : conversation.initiateur;
    };

    const hasUnreadMessages = (conversation) => {
        return conversation.messages?.some(
            m => !m.lu_par_destinataire && m.expediteur_id !== user?.id
        );
    };

    useEffect(() => {
        if (loadingAuth) return;

        if (!user) {
            navigate("/login");
            return;
        }

        const fetchConversations = async () => {
            try {
                setLoading(true);
                const res = await api.get("/conversations");
                setConversations(res.data);

                const conversationIdToOpen = location.state?.conversationId;
                if (conversationIdToOpen) {
                    const conv = res.data.find(c => c.id === conversationIdToOpen);
                    if (conv) {
                        // Ouvrir la conversation automatiquement
                        handleSelectConversation(conv);
                    }
                }
            } catch (err) {
                console.error("Erreur chargement conversations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user, loadingAuth, navigate, location.state?.conversationId, handleSelectConversation]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 text-lg">Chargement des messages...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-[70vh]">

                {/* Liste des conversations */}
                <div className={`w-full md:w-1/3 border-r border-gray-200 overflow-y-auto ${selectedConversation ? 'hidden md:block' : 'block'}`}>
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
                            <p className="text-lg font-medium">Aucune conversation</p>
                            <p className="text-sm mt-2">Contactez un vendeur depuis une annonce pour démarrer une conversation</p>
                        </div>
                    ) : (
                        conversations.map((conversation) => {
                            const interlocuteur = getInterlocuteur(conversation);
                            const unread = hasUnreadMessages(conversation);
                            const isSelected = selectedConversation?.id === conversation.id;

                            const photo = conversation.annonce?.photos?.[0];
                            const photoUrl = photo?.url?.startsWith("/uploads")
                                ? `http://localhost:5000${photo.url}`
                                : photo?.url;

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => handleSelectConversation(conversation)}
                                    className={`w-full text-left px-4 py-4 border-b border-gray-100 hover:bg-gray-100 transition-colors ${isSelected ? 'bg-gray-100' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Photo de l'annonce */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt={conversation.annonce?.titre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs text-center">Pas d'image</span>
                                            )}
                                        </div>

                                        {/* Infos */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {unread && (
                                                        <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
                                                    )}

                                                    <p className="text-sm text-gray-500 truncate">
                                                        {conversation.annonce?.deleted_at ? (
                                                            <span className="italic text-gray-400">Annonce supprimée</span>
                                                        ) : (
                                                        conversation.annonce?.titre
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {formatDate(conversation.date_derniere_activite)}
                                                </span>
                                            </div>
                                            {/* Affichage du dernier message */}
                                            <p className={`text-sm text-gray-700 truncate mt-0.5 ${unread ? 'font-bold' : ''}`}>
                                                {conversation.messages?.[0] ? (
                                                    <>
                                                        <span className="text-gray-600">
                                                            {conversation.messages[0].expediteur_id === user?.id ? 'Vous : ' : `${interlocuteur?.pseudo} : `}
                                                        </span>
                                                        {conversation.messages[0].contenu}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-700 italic">Aucun message</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div> 

                {/* Zone de messages */}
                <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                    {!selectedConversation ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Sélectionnez une conversation</p>
                        </div>
                    ) : (
                        <>
                            {/* Header de la conversation */}
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden text-green-600 hover:text-green-800"
                                >
                                    ←
                                </button>

                                <div>
                                    <Link
                                        to={`/profil/${getInterlocuteur(selectedConversation)?.id}`}
                                        className="font-semibold text-green-600 hover:underline"
                                    >
                                        {getInterlocuteur(selectedConversation)?.pseudo}
                                    </Link>

                                    {/* 👇 Si l'annonce est supprimée, pas de lien cliquable */}
                                    {selectedConversation.annonce?.deleted_at ? (
                                        <p className="block text-sm text-gray-400 italic">
                                            Annonce supprimée
                                        </p>
                                    ) : (
                                        <Link
                                            to={`/annonces/${selectedConversation.annonce?.id}`}
                                            className="block text-sm text-gray-700 hover:underline truncate"
                                        >
                                            {selectedConversation.annonce?.titre}
                                            {selectedConversation.annonce?.prix && (
                                                <span className="ml-2 text-green-600 font-medium">
                                                    {selectedConversation.annonce.prix} €
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-gray-500">Chargement...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-gray-400">Aucun message, démarrez la conversation !</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message) => {
                                            const isOwn = message.expediteur_id === user?.id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                        isOwn
                                                            ? 'bg-green-600 text-white rounded-br-sm'
                                                            : 'bg-gray-200 text-gray-700 rounded-bl-sm'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{message.contenu}</p>
                                                        <p className={`text-xs mt-1 ${isOwn ? 'text-green-200' : 'text-gray-500'}`}>
                                                            {formatDate(message.date_envoi)}
                                                            {isOwn && (
                                                                <span className="ml-1">
                                                                    {message.lu_par_destinataire ? '✓✓' : '✓'}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messageEndRef} className="h-4" />
                                    </>
                                )}
                            </div>

                            {/* Zone de saisie */}
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <div className="flex gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Écrire un message..."
                                        rows={1}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-600"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-green-600 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Envoyer
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div> 

            </div> 
        </div>
    );
}