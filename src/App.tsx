// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Star,
  Plus,
  Award,
  Navigation,
  ThumbsUp,
  Info,
  UserCircle,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  Bell,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Edit2,
  Trash2,
  Search,
  MessageCircle,
  Send,
} from "lucide-react";

// === FIREBASE IMPORTS ===
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";

// === RISOLUZIONE ERRORI TYPESCRIPT PER VERCEL ===
declare const __firebase_config: any;
declare const __app_id: any;
declare const __initial_auth_token: any;
declare global {
  interface Window {
    google: any;
  }
}

// =====================================================================
// 1️⃣ CHIAVE GOOGLE MAPS (Serve per cercare i nomi dei locali)
// =====================================================================
const GOOGLE_MAPS_API_KEY = "AIzaSyALxogT9uBTtHAWA1yvOJGxabPA-HbSnHE";
// =====================================================================

// === CONFIGURAZIONE FIREBASE ===
const configString =
  typeof __firebase_config !== "undefined" ? __firebase_config : null;
let myConfig = null;

if (configString) {
  try {
    myConfig =
      typeof configString === "string"
        ? JSON.parse(configString)
        : configString;
  } catch (e) {}
}

if (!myConfig) {
  // =====================================================================
  // 2️⃣ CHIAVE FIREBASE (Usa la chiave con Identity Toolkit API!)
  // =====================================================================
  myConfig = {
    apiKey: "AIzaSyDm6K6NewCWzVT3383lesp15JzVVTdbirI", // Assicurati che questa sia la chiave sbloccata
    authDomain: "cibodizona.firebaseapp.com",
    projectId: "cibodizona",
    storageBucket: "cibodizona.firebasestorage.app",
    messagingSenderId: "1071596932087",
    appId: "1:1071596932087:web:bd2ee50ebe43ca4ce13cf2",
  };
}

const app = getApps().length === 0 ? initializeApp(myConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// @ts-ignore
const databaseId =
  typeof __app_id !== "undefined" ? __app_id : "cibodizona-app";

// === LOGO IMMAGINE CARICATA ===
const LogoIcon = () => (
  <div className="h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105 shrink-0 flex items-center justify-center">
    <img
      src="/logo.jpg"
      alt="CiboDiZona"
      className="h-full w-full object-contain"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "https://placehold.co/100x100/ea580c/ffffff?text=Logo&font=montserrat";
      }}
    />
  </div>
);

// === IMMAGINI A TEMA ===
const defaultFoodImage =
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80";
const restaurantPlaceholders = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
];
const streetFoodPlaceholders = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
  "https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80",
];
const getRandomImage = (type) => {
  const arr =
    type === "Street Food" ? streetFoodPlaceholders : restaurantPlaceholders;
  return arr[Math.floor(Math.random() * arr.length)];
};

const ITALIAN_PROVINCES = [
  "Agrigento",
  "Alessandria",
  "Ancona",
  "Aosta",
  "Arezzo",
  "Ascoli Piceno",
  "Asti",
  "Avellino",
  "Bari",
  "Barletta-Andria-Trani",
  "Belluno",
  "Benevento",
  "Bergamo",
  "Biella",
  "Bologna",
  "Bolzano",
  "Brescia",
  "Brindisi",
  "Cagliari",
  "Caltanissetta",
  "Campobasso",
  "Carbonia-Iglesias",
  "Caserta",
  "Catania",
  "Catanzaro",
  "Chieti",
  "Como",
  "Cosenza",
  "Cremona",
  "Crotone",
  "Cuneo",
  "Enna",
  "Fermo",
  "Ferrara",
  "Firenze",
  "Foggia",
  "Forlì-Cesena",
  "Frosinone",
  "Genova",
  "Gorizia",
  "Grosseto",
  "Imperia",
  "Isernia",
  "L'Aquila",
  "La Spezia",
  "Latina",
  "Lecce",
  "Lecco",
  "Livorno",
  "Lodi",
  "Lucca",
  "Macerata",
  "Mantova",
  "Massa-Carrara",
  "Matera",
  "Medio Campidano",
  "Messina",
  "Milano",
  "Modena",
  "Monza e della Brianza",
  "Napoli",
  "Novara",
  "Nuoro",
  "Ogliastra",
  "Olbia-Tempio",
  "Oristano",
  "Padova",
  "Palermo",
  "Parma",
  "Pavia",
  "Perugia",
  "Pesaro e Urbino",
  "Pescara",
  "Piacenza",
  "Pisa",
  "Pistoia",
  "Pordenone",
  "Potenza",
  "Prato",
  "Ragusa",
  "Ravenna",
  "Reggio Calabria",
  "Reggio Emilia",
  "Rieti",
  "Rimini",
  "Roma",
  "Rovigo",
  "Salerno",
  "Sassari",
  "Savona",
  "Siena",
  "Siracusa",
  "Sondrio",
  "Taranto",
  "Teramo",
  "Terni",
  "Torino",
  "Trapani",
  "Trento",
  "Treviso",
  "Trieste",
  "Udine",
  "Varese",
  "Venezia",
  "Verbano-Cusio-Ossola",
  "Vercelli",
  "Verona",
  "Vibo Valentia",
  "Vicenza",
  "Viterbo",
];

// === TRADUZIONI ===
const translations = {
  it: {
    appName: "CiboDiZona",
    becomeLocal: "Diventa Local",
    editProfile: "Modifica Profilo",
    suggestPlace: "Consiglia un Posto",
    suggest: "Consiglia",
    heroTitle1: "Mangia come",
    heroTitle2: "un vero Local",
    heroSubtitle:
      "Dimentica le trappole per turisti. Scopri i veri tesori culinari, consigliati esclusivamente dai residenti.",
    wherePlaceholder: "Città o provincia...",
    searchBtn: "Cerca",
    whereAreYou: "Esplora le province",
    recommendedPlaces: "locali consigliati",
    backToMap: "← Torna alla home",
    top10Of: "La Top 10 di",
    rankingInfo:
      "Classifica reale basata sul numero di consigli indipendenti dei residenti.",
    allPlaces: "Tutti i posti",
    noPlacesFound: "Nessun locale trovato.",
    beFirstLocal:
      "Sii il primo local a consigliare un posto in questa categoria!",
    localVotes: "Consigli",
    cancel: "← Annulla",
    suggestTitle: "Consiglia un Locale",
    suggestSubtitle: "Condividi un tesoro nascosto di",
    photoLabel: "Foto del piatto o del locale",
    photoPlaceholder: "Clicca o trascina una foto qui (opzionale)",
    autoFillLabel: "Cerca il locale con Google",
    orEnterManually: "Non lo trovi? Inseriscilo manualmente",
    googleSearchPlaceholder: "Cerca su Google Maps...",
    placeNamePlaceholder: "Nome Esatto",
    addressPlaceholder: "Indirizzo Esatto",
    whyGoPlaceholder: "Perché un turista dovrebbe andarci?",
    publishBtn: "Invia Consiglio",
    modalTitleAuth: "Diventa un Local",
    modalTitleEdit: "Modifica Profilo",
    modalSubtitle:
      "Difendiamo l'autenticità. Per evitare abusi, potrai consigliare o sostenere locali della tua zona (max 5).",
    namePlaceholder: "Il tuo Nome o Nickname",
    provincePlaceholder: "Seleziona la tua provincia...",
    provinceWarning:
      "⚠️ Attenzione: perderai i consigli precedenti cambiando provincia!",
    provinceLocked: "🔒 Cambio provincia non più disponibile.",
    confirmProvinceChange:
      "Stai cambiando provincia. Perderai TUTTI i consigli inseriti finora. Vuoi procedere?",
    provinceChangedSuccess: "Provincia aggiornata.",
    saveProfile: "Salva Profilo",
    alertCityNotCovered: "Nessun locale in questa provincia. Inizia tu!",
    alertNeedAuthSuggest: "Devi registrarti come Local per consigliare!",
    alertWrongCitySuggest: "Puoi aggiungere solo locali della tua provincia.",
    alertThanks: "Grazie per il tuo consiglio!",
    alertNeedAuthVote: "Devi registrarti per sostenere questo locale!",
    alertWrongCityVote: "Puoi sostenere solo locali della tua zona. Residenza:",
    alertVoteLimit: "Hai raggiunto il limite di 5 consigli.",
    voteAdded: "Consiglio aggiunto! 🏅",
    voteRemoved: "Consiglio ritirato.",
    duplicateWarning: "Attenzione: locale già presente in classifica!",
    supportThis: "Sostieni questo",
    restaurant: "Ristorante",
    streetFood: "Street Food",
    openMap: "Apri in Maps",
    editPlaceTitle: "Modifica Consiglio",
    saveChanges: "Salva Modifiche",
    confirmDelete: "Vuoi eliminare questo locale dai tuoi consigli?",
    placeDeleted: "Locale rimosso!",
    changesSaved: "Modifiche salvate! ✅",
    readComments: "Leggi i consigli dei Local",
    leaveCommentTitle: "Sostieni il locale",
    leaveCommentSubtitle: "Aggiungi un consiglio utile (Opzionale)",
    leaveCommentPlaceholder: "Cosa consiglieresti di mangiare qui?",
    confirmVoteBtn: "Conferma Voto",
    commentsModalTitle: "Cosa dicono i Local",
    creatorTag: "Fondatore",
    supporterTag: "Local",
  },
  en: {
    appName: "CiboDiZona",
    becomeLocal: "Become a Local",
    editProfile: "Edit Profile",
    suggestPlace: "Recommend a Place",
    suggest: "Recommend",
    heroTitle1: "Eat like",
    heroTitle2: "a true Local",
    heroSubtitle:
      "Forget tourist traps. Discover real culinary treasures recommended by residents.",
    wherePlaceholder: "City or province...",
    searchBtn: "Search",
    whereAreYou: "Explore provinces",
    recommendedPlaces: "recommended places",
    backToMap: "← Back to home",
    top10Of: "The Top 10 of",
    rankingInfo: "Real ranking based on independent recommendations.",
    allPlaces: "All places",
    noPlacesFound: "No places found.",
    beFirstLocal: "Be the first local to reveal a secret!",
    localVotes: "Tips",
    cancel: "← Cancel",
    suggestTitle: "Recommend a Place",
    suggestSubtitle: "Reveal a hidden treasure of",
    photoLabel: "Photo (optional)",
    photoPlaceholder: "Click to upload a photo",
    autoFillLabel: "Search with Google",
    orEnterManually: "Or enter manually",
    googleSearchPlaceholder: "Search on Maps...",
    placeNamePlaceholder: "Exact Name",
    addressPlaceholder: "Address",
    whyGoPlaceholder: "Why should a tourist go there?",
    publishBtn: "Submit Recommendation",
    modalTitleAuth: "Become a Local",
    modalTitleEdit: "Edit Profile",
    modalSubtitle: "Let's defend authenticity. Max 5 recommendations.",
    namePlaceholder: "Your Nickname",
    provincePlaceholder: "Select province...",
    provinceWarning:
      "⚠️ Warning: you will lose your data if you change province!",
    provinceLocked: "🔒 Province change locked.",
    confirmProvinceChange:
      "Are you sure you want to change province? Data will be lost.",
    provinceChangedSuccess: "Province updated.",
    saveProfile: "Save Profile",
    alertCityNotCovered: "No places found yet. Be the first!",
    alertNeedAuthSuggest: "Register as a Local to recommend!",
    alertWrongCitySuggest: "Only places in your province.",
    alertThanks: "Thanks for sharing!",
    alertNeedAuthVote: "Register to support!",
    alertWrongCityVote: "Only places in your area. Residence:",
    alertVoteLimit: "Max 5 recommendations limit reached.",
    voteAdded: "Recommendation added! 🏅",
    voteRemoved: "Removed.",
    duplicateWarning: "Warning: place already exists!",
    supportThis: "Support this",
    restaurant: "Restaurant",
    streetFood: "Street Food",
    openMap: "Open Maps",
    editPlaceTitle: "Edit Place",
    saveChanges: "Save Changes",
    confirmDelete: "Delete this recommendation?",
    placeDeleted: "Deleted!",
    changesSaved: "Saved! ✅",
    readComments: "Local's tips",
    leaveCommentTitle: "Support this place",
    leaveCommentSubtitle: "Leave a tip (Optional)",
    leaveCommentPlaceholder: "What's the best dish here?",
    confirmVoteBtn: "Confirm Vote",
    commentsModalTitle: "What Locals say",
    creatorTag: "Creator",
    supporterTag: "Local",
  },
};

const initialPlaces = [
  {
    id: "1",
    city: "Napoli",
    name: "L'Antica Pizzeria da Michele",
    type: "Ristorante",
    description: "Un'istituzione. Solo Margherita e Marinara.",
    creatorName: "Gennaro",
    comments: [],
    votes: 542,
    address: "Via Cesare Sersale, 1",
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
  },
  {
    id: "7",
    city: "Roma",
    name: "Felice a Testaccio",
    type: "Ristorante",
    description: "La migliore Cacio e Pepe di Roma.",
    creatorName: "Claudio",
    comments: [],
    votes: 610,
    address: "Via Mastro Giorgio, 29",
    imageUrl:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80",
  },
];

export default function App() {
  const [language, setLanguage] = useState("it");
  const t = translations[language];

  const [currentView, setCurrentView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filterType, setFilterType] = useState("All");

  // Stati Firebase
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const seededRef = useRef(false);

  // Form States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", residenceCity: "" });
  const [newPlace, setNewPlace] = useState({
    name: "",
    city: "",
    type: "Ristorante",
    description: "",
    address: "",
  });
  const [placeToEdit, setPlaceToEdit] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [possibleDuplicates, setPossibleDuplicates] = useState([]);

  // Login States
  const [emailAuth, setEmailAuth] = useState({ email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  const [placeToSupport, setPlaceToSupport] = useState(null);
  const [supportComment, setSupportComment] = useState("");
  const [viewingCommentsFor, setViewingCommentsFor] = useState(null);

  const googleInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsDbReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Inizializzazione Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token =
          typeof window !== "undefined" &&
          typeof __initial_auth_token !== "undefined"
            ? __initial_auth_token
            : null;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        setIsDbReady(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Sync Dati
  useEffect(() => {
    if (!user) return;
    let unsubProfile = () => {};
    const profileRef = doc(
      db,
      "artifacts",
      databaseId,
      "users",
      user.uid,
      "profile",
      "data"
    );
    unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCurrentUser(data);
          setAuthForm({ name: data.name, residenceCity: data.residenceCity });
        }
      },
      (err) => console.error(err)
    );

    const placesRef = collection(
      db,
      "artifacts",
      databaseId,
      "public",
      "data",
      "places"
    );
    const unsubPlaces = onSnapshot(placesRef, (snap) => {
      if (snap.empty && !seededRef.current) {
        seededRef.current = true;
        initialPlaces.forEach((p) => addDoc(placesRef, p).catch((e) => e));
        setPlaces(initialPlaces);
        setIsDbReady(true);
      } else if (!snap.empty) {
        const pList = [];
        snap.forEach((d) => pList.push({ id: d.id, ...d.data() }));
        setPlaces(pList);
        setIsDbReady(true);
      } else {
        setPlaces(initialPlaces);
        setIsDbReady(true);
      }
    });
    return () => {
      unsubProfile();
      unsubPlaces();
    };
  }, [user]);

  // === GOOGLE AUTOCOMPLETE ===
  useEffect(() => {
    if (
      currentView !== "add" ||
      !GOOGLE_MAPS_API_KEY ||
      GOOGLE_MAPS_API_KEY === "INSERISCI_QUI_LA_TUA_CHIAVE_MAPS"
    )
      return;
    const initAutocomplete = () => {
      if (!window.google || !googleInputRef.current) return;
      if (googleInputRef.current.getAttribute("data-has-places")) return;
      googleInputRef.current.setAttribute("data-has-places", "true");
      const autocomplete = new window.google.maps.places.Autocomplete(
        googleInputRef.current,
        {
          types: ["establishment"],
          componentRestrictions: { country: "it" },
          fields: ["name", "formatted_address"],
        }
      );
      autocomplete.addListener("place_changed", () => {
        const p = autocomplete.getPlace();
        if (p && p.name) {
          setNewPlace((prev) => ({
            ...prev,
            name: p.name,
            address: p.formatted_address || "",
          }));
          checkForDuplicates(p.name);
        }
      });
    };
    const sId = "google-maps-script";
    let s = document.getElementById(sId);
    if (!window.google) {
      if (!s) {
        s = document.createElement("script");
        s.id = sId;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", initAutocomplete);
    } else {
      initAutocomplete();
    }
  }, [currentView]);

  const availableCities = useMemo(
    () => [...new Set(places.map((p) => p.city))].sort(),
    [places]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    const cityMatch = availableCities.find((c) => c.toLowerCase() === q);
    if (cityMatch) {
      setSelectedCity(cityMatch);
      setCurrentView("city");
      setSearchQuery("");
    } else {
      const validProv = ITALIAN_PROVINCES.find((p) => p.toLowerCase() === q);
      if (validProv) {
        setSelectedCity(validProv);
        setCurrentView("city");
        setSearchQuery("");
      } else showToast(t.alertCityNotCovered);
    }
  };

  // === FUNZIONI LOGIN ===
  const handleGoogleLogin = async () => {
    showToast("Apertura Google...");
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const res = await signInWithPopup(auth, provider);
      showToast("Accesso riuscito! Completa il tuo profilo.");
    } catch (err) {
      console.error(err);
      setAuthError("Errore Google: " + err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!emailAuth.email || emailAuth.password.length < 6) {
      setAuthError("Email non valida o password troppo corta.");
      return;
    }
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(
          auth,
          emailAuth.email,
          emailAuth.password
        );
        showToast("Benvenuto! Ora imposta il tuo profilo.");
      } else {
        await signInWithEmailAndPassword(
          auth,
          emailAuth.email,
          emailAuth.password
        );
        showToast("Bentornato!");
      }
    } catch (err) {
      setAuthError("Errore: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setShowAuthModal(false);
    showToast("Scollegato.");
    signInAnonymously(auth);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!authForm.name || !authForm.residenceCity) return;

    const data = {
      name: authForm.name,
      residenceCity: authForm.residenceCity,
      votedPlaces: currentUser?.votedPlaces || [],
      provinceChangesCount: currentUser?.provinceChangesCount || 0,
    };

    if (user) {
      const pRef = doc(
        db,
        "artifacts",
        databaseId,
        "users",
        user.uid,
        "profile",
        "data"
      );
      await setDoc(pRef, data);
    }

    setCurrentUser(data);
    showToast("Profilo salvato correttamente! ✅");
    setShowAuthModal(false); // CHIUDE AUTOMATICAMENTE IL MODALE
  };

  const handleAddPlaceClick = () => {
    if (!currentUser) {
      showToast(t.alertNeedAuthSuggest);
      setShowAuthModal(true);
      return;
    }
    if ((currentUser.votedPlaces?.length || 0) >= 5) {
      showToast(t.alertVoteLimit);
      return;
    }
    setNewPlace({ ...newPlace, city: currentUser.residenceCity });
    setImagePreview(null);
    setPossibleDuplicates([]);
    setCurrentView("add");
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!newPlace.name || !newPlace.city || !newPlace.description) return;
    if (
      newPlace.city.toLowerCase() !== currentUser.residenceCity.toLowerCase()
    ) {
      showToast(t.alertWrongCitySuggest);
      return;
    }
    const entry = {
      ...newPlace,
      votes: 1,
      imageUrl: imagePreview || getRandomImage(newPlace.type),
      creatorId: user.uid,
      creatorName: currentUser.name,
      comments: [],
    };
    const pRef = collection(
      db,
      "artifacts",
      databaseId,
      "public",
      "data",
      "places"
    );
    const docRef = await addDoc(pRef, entry);
    const newVotes = [...(currentUser.votedPlaces || []), docRef.id];
    await updateDoc(
      doc(db, "artifacts", databaseId, "users", user.uid, "profile", "data"),
      { votedPlaces: newVotes }
    );
    showToast(t.alertThanks);
    setSelectedCity(currentUser.residenceCity);
    setCurrentView("city");
  };

  const handleVoteClick = (id) => {
    const p = places.find((x) => x.id === id);
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (p.city.toLowerCase() !== currentUser.residenceCity.toLowerCase()) {
      showToast(t.alertWrongCityVote + " " + currentUser.residenceCity);
      return;
    }
    const isVoted = (currentUser.votedPlaces || []).includes(id);
    if (isVoted) removeVote(p);
    else {
      if ((currentUser.votedPlaces?.length || 0) >= 5) {
        showToast(t.alertVoteLimit);
        return;
      }
      setSupportComment("");
      setPlaceToSupport(p);
    }
  };

  const removeVote = async (p) => {
    const newVotes = currentUser.votedPlaces.filter((v) => v !== p.id);
    if (p.votes <= 1) {
      await deleteDoc(
        doc(db, "artifacts", databaseId, "public", "data", "places", p.id)
      );
    } else {
      const newC = (p.comments || []).filter((c) => c.userId !== user.uid);
      await updateDoc(
        doc(db, "artifacts", databaseId, "public", "data", "places", p.id),
        { votes: increment(-1), comments: newC }
      );
    }
    await updateDoc(
      doc(db, "artifacts", databaseId, "users", user.uid, "profile", "data"),
      { votedPlaces: newVotes }
    );
    showToast(t.voteRemoved);
  };

  const confirmSupport = async (e) => {
    e.preventDefault();
    const newC = [...(placeToSupport.comments || [])];
    if (supportComment.trim())
      newC.push({
        userId: user.uid,
        userName: currentUser.name,
        text: supportComment.trim(),
      });
    await updateDoc(
      doc(
        db,
        "artifacts",
        databaseId,
        "public",
        "data",
        "places",
        placeToSupport.id
      ),
      { votes: increment(1), comments: newC }
    );
    const newVotes = [...(currentUser.votedPlaces || []), placeToSupport.id];
    await updateDoc(
      doc(db, "artifacts", databaseId, "users", user.uid, "profile", "data"),
      { votedPlaces: newVotes }
    );
    showToast(t.voteAdded);
    setPlaceToSupport(null);
  };

  const cityTop10 = useMemo(() => {
    if (!selectedCity) return [];
    let f = places.filter((p) => p.city === selectedCity);
    if (filterType !== "All") f = f.filter((p) => p.type === filterType);
    return f.sort((a, b) => b.votes - a.votes).slice(0, 10);
  }, [places, selectedCity, filterType]);

  const handleImageUpload = (e) => {
    const f = e.target.files[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => setImagePreview(ev.target.result);
      r.readAsDataURL(f);
    }
  };

  const checkForDuplicates = (n) => {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const dups = places.filter(
      (p) =>
        p.city === currentUser?.residenceCity && norm(p.name).includes(norm(n))
    );
    setPossibleDuplicates(dups);
  };

  if (!isDbReady)
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-stone-500 font-bold animate-pulse">
          Caricamento CiboDiZona...
        </p>
      </div>
    );

  const canChangeProvince =
    !currentUser || (currentUser.provinceChangesCount || 0) < 1;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 relative">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 w-max max-w-[90vw]">
          <div className="bg-stone-900 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 border border-stone-700">
            <Bell size={20} className="text-orange-400" /> <span>{toast}</span>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView("home")}
          >
            <LogoIcon />
            <span className="text-xl sm:text-2xl font-black tracking-tight hidden sm:inline ml-1">
              <span className="text-orange-500">Cibo</span>
              <span className="text-green-800">DiZona</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
              <button
                onClick={() => setLanguage("it")}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  language === "it" ? "bg-white shadow-sm" : "opacity-40"
                }`}
              >
                🇮🇹
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  language === "en" ? "bg-white shadow-sm" : "opacity-40"
                }`}
              >
                🇬🇧
              </button>
            </div>
            {currentUser ? (
              <div
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-orange-200"
              >
                <UserCircle size={18} className="text-orange-600" />
                <span className="text-sm font-bold text-orange-800 hidden sm:inline">
                  {currentUser.name}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-orange-600"
              >
                <UserCircle size={20} />{" "}
                <span className="hidden sm:inline">{t.becomeLocal}</span>
              </button>
            )}
            <button
              onClick={handleAddPlaceClick}
              className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-orange-600 flex items-center gap-1"
            >
              <Plus size={16} />{" "}
              <span className="hidden sm:inline">{t.suggestPlace}</span>
              <span className="sm:hidden">{t.suggest}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {currentView === "home" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-orange-500 rounded-[2rem] p-8 sm:p-14 text-center text-white shadow-2xl mb-12 overflow-hidden relative">
              <div className="relative z-10">
                <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
                  {t.heroTitle1} <br /> {t.heroTitle2}
                </h1>
                <p className="text-orange-50 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-medium">
                  {t.heroSubtitle}
                </p>
                <form
                  onSubmit={handleSearch}
                  className="max-w-2xl mx-auto relative flex items-center"
                >
                  <MapPin
                    className="absolute left-4 text-orange-500 z-10"
                    size={24}
                  />
                  <input
                    type="text"
                    placeholder={t.wherePlaceholder}
                    className="w-full pl-12 pr-28 py-4 rounded-full text-stone-800 text-lg font-medium shadow-xl focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 bg-stone-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-stone-800"
                  >
                    {t.searchBtn}
                  </button>
                </form>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-3">
              <Star className="text-orange-500" fill="currentColor" />{" "}
              {t.whereAreYou}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {availableCities.map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setCurrentView("city");
                  }}
                  className="bg-white rounded-[1.5rem] p-4 shadow-md hover:shadow-xl cursor-pointer group border border-stone-100"
                >
                  <div className="h-40 rounded-xl overflow-hidden mb-3 relative bg-stone-100">
                    <img
                      src={
                        places.find((p) => p.city === city)?.imageUrl ||
                        defaultFoodImage
                      }
                      alt={city}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 className="absolute bottom-3 left-4 text-2xl font-black text-white">
                      {city}
                    </h3>
                  </div>
                  <p className="text-stone-500 font-bold text-sm">
                    {places.filter((p) => p.city === city).length}{" "}
                    {t.recommendedPlaces}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "city" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setCurrentView("home")}
              className="text-stone-500 hover:text-stone-800 font-bold mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm w-fit transition-colors"
            >
              {t.backToMap}
            </button>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-2">
                  {t.top10Of}{" "}
                  <span className="text-orange-600">{selectedCity}</span>
                </h1>
                <p className="text-stone-500 flex items-center gap-2 font-medium">
                  <ShieldCheck size={20} className="text-orange-400" />{" "}
                  {t.rankingInfo}
                </p>
              </div>
              <div className="flex gap-2">
                {["All", "Ristorante", "Street Food"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${
                      filterType === type
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-600 border-stone-200"
                    }`}
                  >
                    {type === "All"
                      ? t.allPlaces
                      : type === "Ristorante"
                      ? t.restaurant
                      : t.streetFood}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {cityTop10.map((place, idx) => {
                const isVoted = (currentUser?.votedPlaces || []).includes(
                  place.id
                );
                return (
                  <div
                    key={place.id}
                    className="bg-white rounded-[2rem] p-4 shadow-md flex flex-col sm:flex-row gap-6 relative group"
                  >
                    <div className="hidden sm:flex items-center justify-center w-12 text-5xl font-black text-stone-100">
                      {idx + 1}
                    </div>
                    <div className="w-full sm:w-64 h-48 sm:h-auto overflow-hidden rounded-2xl bg-stone-50">
                      <img
                        src={place.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 py-2">
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded bg-stone-100 text-stone-500 uppercase mb-2 inline-block`}
                      >
                        {place.type}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-1">
                        {place.name}
                      </h2>
                      <p className="text-stone-500 text-sm mb-4 flex items-center gap-1">
                        <MapPin size={14} /> {place.address || place.city}
                      </p>
                      <p className="text-stone-700 text-lg bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 italic">
                        "{place.description}"
                      </p>
                      <button
                        onClick={() => setViewingCommentsFor(place)}
                        className="mt-4 flex items-center gap-2 text-stone-400 hover:text-orange-600 font-bold text-xs"
                      >
                        <MessageCircle size={14} /> {t.readComments} (
                        {(place.comments?.length || 0) + 1})
                      </button>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 flex sm:flex-col items-center justify-center gap-2 min-w-[100px]">
                      <button
                        onClick={() => handleVoteClick(place.id)}
                        className={`p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${
                          isVoted
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {isVoted ? (
                          <ThumbsUp className="fill-white" />
                        ) : (
                          <ThumbsUp />
                        )}
                      </button>
                      <div className="text-center">
                        <span className="block font-black text-2xl">
                          {place.votes}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          {t.localVotes}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === "add" && (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setCurrentView("home")}
              className="text-stone-500 font-bold mb-6"
            >
              {t.cancel}
            </button>
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-stone-100">
              <h2 className="text-3xl font-black mb-8">{t.suggestTitle}</h2>
              <form onSubmit={handleAddPlace} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    {t.photoLabel}
                  </label>
                  <div className="relative h-48 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center bg-stone-50 hover:border-orange-500 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <ImageIcon className="text-stone-300" size={40} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-blue-900 mb-2">
                    {t.autoFillLabel}
                  </label>
                  <div className="relative">
                    <input
                      ref={googleInputRef}
                      type="text"
                      placeholder={t.googleSearchPlaceholder}
                      className="w-full border-2 border-blue-100 bg-blue-50/30 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none font-bold"
                    />
                    <Search
                      className="absolute left-3 top-3.5 text-blue-300"
                      size={18}
                    />
                  </div>
                </div>
                {possibleDuplicates.length > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <p className="text-orange-800 text-xs font-bold mb-2 uppercase flex items-center gap-1">
                      <AlertTriangle size={14} /> {t.duplicateWarning}
                    </p>
                    {possibleDuplicates.map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between items-center bg-white p-2 rounded-lg mb-1 shadow-sm"
                      >
                        <span className="text-sm font-bold">{d.name}</span>
                        <button
                          type="button"
                          onClick={() => handleVoteClick(d.id)}
                          className="text-[10px] bg-stone-900 text-white px-2 py-1 rounded font-bold"
                        >
                          SOSTIENI
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    placeholder={t.placeNamePlaceholder}
                    className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 font-medium"
                    value={newPlace.name}
                    onChange={(e) => {
                      setNewPlace({ ...newPlace, name: e.target.value });
                      checkForDuplicates(e.target.value);
                    }}
                  />
                  <select
                    className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 font-medium bg-white"
                    value={newPlace.type}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, type: e.target.value })
                    }
                  >
                    <option value="Ristorante">{t.restaurant}</option>
                    <option value="Street Food">{t.streetFood}</option>
                  </select>
                </div>
                <textarea
                  required
                  rows="4"
                  placeholder={t.whyGoPlaceholder}
                  className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 font-medium resize-none"
                  value={newPlace.description}
                  onChange={(e) =>
                    setNewPlace({ ...newPlace, description: e.target.value })
                  }
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-black transition-colors"
                >
                  {t.publishBtn}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal Autenticazione (Google & Email) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 bg-stone-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            {!user || user.isAnonymous ? (
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                  <UserCircle size={40} />
                </div>
                <h2 className="text-2xl font-black mb-2">{t.modalTitleAuth}</h2>
                <p className="text-stone-500 text-sm mb-8">{t.modalSubtitle}</p>
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border-2 border-stone-100 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continua con Google
                  </button>
                  <div className="flex items-center gap-4 text-stone-300 text-xs font-bold uppercase">
                    <hr className="flex-1" /> oppure <hr className="flex-1" />
                  </div>
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                      value={emailAuth.email}
                      onChange={(e) =>
                        setEmailAuth({ ...emailAuth, email: e.target.value })
                      }
                    />
                    <input
                      type="password"
                      placeholder="Password (min. 6)"
                      className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                      value={emailAuth.password}
                      onChange={(e) =>
                        setEmailAuth({ ...emailAuth, password: e.target.value })
                      }
                    />
                    {authError && (
                      <p className="text-red-500 text-xs font-bold text-left">
                        {authError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold"
                    >
                      {isRegistering ? "Registrati" : "Accedi"}
                    </button>
                  </form>
                  <button
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setAuthError("");
                    }}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    {isRegistering
                      ? "Hai già un account? Accedi"
                      : "Nuovo utente? Crea un account CiboDiZona"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black mb-1">
                  {currentUser ? t.modalTitleEdit : "Completa Profilo"}
                </h2>
                <p className="text-stone-500 text-sm mb-6">{t.modalSubtitle}</p>
                <form onSubmit={saveProfile} className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder={t.namePlaceholder}
                    className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                  />
                  <div className="relative">
                    <select
                      required
                      className={`w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none bg-white ${
                        !canChangeProvince
                          ? "bg-stone-50 text-stone-400 cursor-not-allowed"
                          : "focus:border-orange-500"
                      }`}
                      value={authForm.residenceCity}
                      onChange={(e) =>
                        setAuthForm({
                          ...authForm,
                          residenceCity: e.target.value,
                        })
                      }
                      disabled={!canChangeProvince}
                    >
                      <option value="" disabled>
                        {t.provincePlaceholder}
                      </option>
                      {ITALIAN_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {!canChangeProvince && (
                      <Lock
                        size={16}
                        className="absolute right-4 top-4 text-stone-300"
                      />
                    )}
                  </div>
                  {currentUser && (
                    <p className="text-[10px] font-bold text-stone-400 px-2">
                      {canChangeProvince ? t.provinceWarning : t.provinceLocked}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-orange-700 transition-colors"
                  >
                    {t.saveProfile}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-stone-400 font-bold text-sm mt-4 hover:text-red-500 transition-colors"
                  >
                    Scollegati
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Altri Modali */}
      {placeToSupport && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setPlaceToSupport(null)}
              className="absolute top-5 right-5 text-stone-400 p-2"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-1">{t.leaveCommentTitle}</h2>
            <p className="text-stone-500 text-sm mb-4">
              {t.leaveCommentSubtitle}
            </p>
            <form onSubmit={confirmSupport} className="space-y-4">
              <textarea
                rows={3}
                placeholder={t.leaveCommentPlaceholder}
                className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 font-medium resize-none"
                value={supportComment}
                onChange={(e) => setSupportComment(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={20} /> {t.confirmVoteBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingCommentsFor && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-orange-50 sm:rounded-[2rem] rounded-t-[2rem] w-full max-w-xl shadow-2xl h-[85vh] sm:h-auto overflow-hidden flex flex-col">
            <div className="p-6 bg-white border-b border-stone-100 relative">
              <button
                onClick={() => setViewingCommentsFor(null)}
                className="absolute top-5 right-5 text-stone-400 p-2"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black">{t.commentsModalTitle}</h2>
              <p className="text-orange-600 font-bold">
                {viewingCommentsFor.name}
              </p>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-orange-500" />
                  <span className="font-black text-sm">
                    {viewingCommentsFor.creatorName}
                  </span>{" "}
                  <span className="text-[9px] uppercase font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                    {t.creatorTag}
                  </span>
                </div>
                <p className="text-stone-700 font-medium">
                  "{viewingCommentsFor.description}"
                </p>
              </div>
              {viewingCommentsFor.comments?.map((c, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp size={16} className="text-green-500" />
                    <span className="font-black text-sm">
                      {c.userName}
                    </span>{" "}
                    <span className="text-[9px] uppercase font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded">
                      {t.supporterTag}
                    </span>
                  </div>
                  <p className="text-stone-700 font-medium">"{c.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
