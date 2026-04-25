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
// ⚠️ INSERISCI QUI LA TUA CHIAVE API DI GOOGLE CLOUD (Places API) ⚠️
// =====================================================================
const GOOGLE_MAPS_API_KEY = "AIzaSyCX1dzgDDQJ6gotGE5D9JnD7EBqb4Bs9ls";
// =====================================================================

// === TRUCCO PER VERCEL & CANVAS ===
// @ts-ignore
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
  myConfig = {
    apiKey: "AIzaSyDQ6iBJU128pfFs6LuykZb_m62ED8dwHos",
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

// === DIZIONARIO TRADUZIONI ===
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
      "Difendiamo l'autenticità. Per evitare abusi, potrai consigliare o sostenere esclusivamente locali situati nella tua provincia (max 5 consigli in totale).",
    namePlaceholder: "Il tuo Nome o Nickname",
    provincePlaceholder: "Seleziona la tua provincia...",
    provinceWarning:
      "⚠️ Attenzione: se cambi provincia perderai i tuoi consigli precedenti! (Puoi farlo 1 sola volta)",
    provinceLocked: "🔒 Hai già utilizzato il tuo unico cambio di provincia.",
    confirmProvinceChange:
      "ATTENZIONE! Stai cambiando la tua provincia. Perderai TUTTI i consigli e i locali che hai inserito finora. Potrai cambiare provincia solo 1 volta. Vuoi procedere davvero?",
    provinceChangedSuccess: "Provincia aggiornata e vecchi consigli resettati.",
    saveProfile: "Salva Profilo",
    alertCityNotCovered:
      "Nessun locale consigliato in questa provincia. Inizia tu!",
    alertNeedAuthSuggest:
      "Devi registrarti come Local per consigliare un posto!",
    alertWrongCitySuggest:
      "Puoi aggiungere solo locali situati nella tua stessa provincia di residenza.",
    alertThanks: "Grazie per aver condiviso il tuo consiglio!",
    alertNeedAuthVote:
      "Devi registrarti come Local per sostenere questo locale!",
    alertWrongCityVote:
      "Puoi sostenere solo i locali della tua zona! La tua residenza è a",
    alertVoteLimit:
      "Hai raggiunto il limite! Hai a disposizione un massimo di 5 consigli.",
    voteAdded: "Consiglio aggiunto! 🏅",
    voteRemoved:
      "Consiglio ritirato. Hai recuperato un voto da poter riutilizzare!",
    duplicateWarning:
      "Attenzione: questo locale potrebbe essere già presente in classifica!",
    supportThis: "Sostieni questo",
    restaurant: "Ristorante",
    streetFood: "Street Food",
    openMap: "Apri in Maps",
    editPlaceTitle: "Modifica Consiglio",
    saveChanges: "Salva Modifiche",
    confirmDelete:
      "Sei sicuro di voler eliminare questo locale dai tuoi consigli? Se lo elimini, recupererai il voto speso.",
    placeDeleted: "Locale rimosso dai consigli e voto recuperato!",
    changesSaved: "Modifiche salvate! ✅",
    readComments: "Leggi i consigli dei Local",
    leaveCommentTitle: "Sostieni il locale",
    leaveCommentSubtitle:
      "Vuoi aggiungere un consiglio per chi leggerà? (Opzionale)",
    leaveCommentPlaceholder:
      "Es. Assaggiate la carbonara, è la fine del mondo!",
    confirmVoteBtn: "Conferma Voto",
    commentsModalTitle: "Cosa dicono i Local",
    creatorTag: "Primo Local a consigliarlo",
    supporterTag: "Local che lo consiglia",
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
      "Forget tourist traps. Discover the real culinary treasures recommended exclusively by locals.",
    wherePlaceholder: "City or province...",
    searchBtn: "Search",
    whereAreYou: "Explore provinces",
    recommendedPlaces: "recommended places",
    backToMap: "← Back to home",
    top10Of: "The Top 10 of",
    rankingInfo:
      "Real ranking based on the number of independent recommendations from residents.",
    allPlaces: "All places",
    noPlacesFound: "No places found.",
    beFirstLocal: "Be the first local to reveal a secret in this category!",
    localVotes: "Tips",
    cancel: "← Cancel",
    suggestTitle: "Recommend a Place",
    suggestSubtitle: "Reveal a hidden treasure of",
    photoLabel: "Photo of the dish or place",
    photoPlaceholder: "Click or drag a photo here (optional)",
    autoFillLabel: "Search the place with Google",
    orEnterManually: "Can't find it? Enter it manually",
    googleSearchPlaceholder: "Search on Google Maps...",
    placeNamePlaceholder: "Exact Name",
    addressPlaceholder: "Exact Address",
    whyGoPlaceholder: "Why should a tourist go there?",
    publishBtn: "Submit Recommendation",
    modalTitleAuth: "Become a Local",
    modalTitleEdit: "Edit Profile",
    modalSubtitle:
      "Let's defend authenticity. To prevent spam, you can only recommend places located in your province (max 5 recommendations in total).",
    namePlaceholder: "Your Name or Nickname",
    provincePlaceholder: "Select your province...",
    provinceWarning:
      "⚠️ Warning: if you change province you will lose your previous recommendations! (1 change allowed)",
    provinceLocked: "🔒 You have already used your only province change.",
    confirmProvinceChange:
      "WARNING! You are changing your province. You will lose ALL the recommendations you made so far. You can only change province 1 time. Do you really want to proceed?",
    provinceChangedSuccess: "Province updated and old recommendations reset.",
    saveProfile: "Save Profile",
    alertCityNotCovered: "No places found in this province yet. Be the first!",
    alertNeedAuthSuggest: "You must register as a Local to recommend a place!",
    alertWrongCitySuggest:
      "You can only add places located in your own province of residence.",
    alertThanks: "Thank you for sharing your local secret!",
    alertNeedAuthVote:
      "You must register as a Local to support this recommendation!",
    alertWrongCityVote:
      "You can only support places in your area! Your residence is set to",
    alertVoteLimit:
      "Limit reached! You have a maximum of 5 recommendations to use.",
    voteAdded: "Recommendation added! 🏅",
    voteRemoved: "Recommendation removed. You got one vote back!",
    duplicateWarning: "Warning: this place might already be in the ranking!",
    supportThis: "Support this",
    restaurant: "Restaurant",
    streetFood: "Street Food",
    openMap: "Open Maps",
    editPlaceTitle: "Edit Place",
    saveChanges: "Save Changes",
    confirmDelete:
      "Are you sure you want to delete this recommendation? If you delete it, you will get your vote back.",
    placeDeleted: "Recommendation deleted and vote recovered!",
    changesSaved: "Changes saved! ✅",
    readComments: "Read Local's tips",
    leaveCommentTitle: "Support this place",
    leaveCommentSubtitle: "Want to leave a tip for others? (Optional)",
    leaveCommentPlaceholder: "E.g. Try their carbonara, it's amazing!",
    confirmVoteBtn: "Confirm Vote",
    commentsModalTitle: "What Locals say",
    creatorTag: "First Local to recommend it",
    supporterTag: "Local recommending it",
  },
};

const initialPlaces = [
  {
    id: "1",
    city: "Napoli",
    name: "L'Antica Pizzeria da Michele",
    type: "Ristorante",
    description:
      "Un'istituzione. Solo Margherita e Marinara, ma sono la fine del mondo.",
    creatorName: "Gennaro",
    comments: [],
    votes: 542,
    address: "Via Cesare Sersale, 1",
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
  },
  {
    id: "2",
    city: "Napoli",
    name: "Friggitoria Fiorenzano",
    type: "Street Food",
    description:
      "Il vero cuoppo napoletano. Frittura leggera e croccante, perfetto per passeggiare.",
    creatorName: "Ciro",
    comments: [],
    votes: 489,
    address: "Via Pignasecca, 48",
    imageUrl:
      "https://images.unsplash.com/photo-1626200419188-f56cedcc2bce?w=500&q=80",
  },
  {
    id: "3",
    city: "Napoli",
    name: "Trattoria da Nennella",
    type: "Ristorante",
    description:
      "Pasta e patate con la provola indimenticabile. Atmosfera verace e chiassosa, vera Napoli.",
    creatorName: "Maria",
    comments: [],
    votes: 450,
    address: "Vico Lungo Teatro Nuovo, 103",
    imageUrl:
      "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=500&q=80",
  },
  {
    id: "7",
    city: "Roma",
    name: "Felice a Testaccio",
    type: "Ristorante",
    description:
      "La migliore Cacio e Pepe di Roma, mantecata direttamente al tavolo.",
    creatorName: "Claudio",
    comments: [],
    votes: 610,
    address: "Via Mastro Giorgio, 29",
    imageUrl:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80",
  },
  {
    id: "8",
    city: "Roma",
    name: "Trapizzino",
    type: "Street Food",
    description:
      "Tasche di pizza bianca ripiene dei grandi classici romani (pollo alla cacciatora, polpette al sugo).",
    creatorName: "Sara",
    comments: [],
    votes: 520,
    address: "Piazza Trilussa, 46",
    imageUrl:
      "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80",
  },
  {
    id: "12",
    city: "Bologna",
    name: "Osteria dell'Orsa",
    type: "Ristorante",
    description:
      "Tagliatelle al ragù spettacolari a prezzi onesti. Sempre pieno di local e studenti.",
    creatorName: "Matteo",
    comments: [],
    votes: 490,
    address: "Via Mentana, 1",
    imageUrl:
      "https://images.unsplash.com/photo-1626844131082-256783844137?w=500&q=80",
  },
  {
    id: "13",
    city: "Bologna",
    name: "Cremeria Santo Stefano",
    type: "Street Food",
    description:
      "Non è un pasto, ma il gelato qui è considerato sacro dai bolognesi.",
    creatorName: "Elena",
    comments: [],
    votes: 450,
    address: "Via Santo Stefano, 70c",
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?w=500&q=80",
  },
  {
    id: "14",
    city: "Modena",
    name: "Trattoria Aldina",
    type: "Ristorante",
    description:
      "Tortellini in brodo da sogno e un bollito che ti rimette al mondo.",
    creatorName: "Luca",
    comments: [],
    votes: 580,
    address: "Via Luigi Albinelli, 40",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80",
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

  // Stati per Firebase & Auth
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const seededRef = useRef(false);

  // Form e UI States
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

  // Nuovi stati per i Commenti/Consigli
  const [placeToSupport, setPlaceToSupport] = useState(null);
  const [supportComment, setSupportComment] = useState("");
  const [viewingCommentsFor, setViewingCommentsFor] = useState(null);

  const googleInputRef = useRef(null);
  const googleProvider = new GoogleAuthProvider(); // AGGIUNTO PER GOOGLE AUTH

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsDbReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Inizializzazione Autenticazione
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
        console.warn("Auth fallita. Uso modalità locale.");
        setIsDbReady(true);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Ascolto dati da Firebase
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
        if (snap.exists()) setCurrentUser(snap.data());
      },
      (err) => console.error("Errore profilo", err)
    );

    const placesRef = collection(
      db,
      "artifacts",
      databaseId,
      "public",
      "data",
      "places"
    );
    const unsubPlaces = onSnapshot(
      placesRef,
      (snap) => {
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
      },
      (err) => {
        console.warn("Lettura Firestore fallita. Uso dati locali.");
        setPlaces(initialPlaces);
        setIsDbReady(true);
      }
    );

    return () => {
      unsubProfile();
      unsubPlaces();
    };
  }, [user]);

  // === INIZIALIZZAZIONE GOOGLE PLACES API CON PREVENZIONE BLOCCHI ===
  useEffect(() => {
    if (
      currentView !== "add" ||
      !GOOGLE_MAPS_API_KEY ||
      GOOGLE_MAPS_API_KEY === "INSERISCI_QUI_LA_TUA_CHIAVE_GOOGLE"
    )
      return;

    const initAutocomplete = () => {
      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places ||
        !googleInputRef.current
      )
        return;

      // Impedisce la creazione di istanze multiple che potrebbero rallentare o bloccare l'input
      if (googleInputRef.current.getAttribute("data-has-places")) return;
      googleInputRef.current.setAttribute("data-has-places", "true");

      const autocomplete = new window.google.maps.places.Autocomplete(
        googleInputRef.current,
        {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "it" },
          fields: ["name", "formatted_address"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const placeInfo = autocomplete.getPlace();
        if (placeInfo && placeInfo.name) {
          setNewPlace((prev) => ({
            ...prev,
            name: placeInfo.name,
            address: placeInfo.formatted_address || "",
          }));
          checkForDuplicates(placeInfo.name);
        }
      });
    };

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId);

    if (!window.google) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initAutocomplete);
    } else {
      initAutocomplete();
    }

    return () => {
      if (script) script.removeEventListener("load", initAutocomplete);
      if (googleInputRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(googleInputRef.current);
        googleInputRef.current.removeAttribute("data-has-places");
      }
    };
  }, [currentView]);

  const availableCities = useMemo(() => {
    const cities = places.map((p) => p.city);
    return [...new Set(cities)].sort();
  }, [places]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();

    const cityMatch = availableCities.find((c) => c.toLowerCase() === query);

    if (cityMatch) {
      setSelectedCity(cityMatch);
      setCurrentView("city");
      setSearchQuery("");
    } else {
      const validProv = ITALIAN_PROVINCES.find(
        (p) => p.toLowerCase() === query
      );
      if (validProv) {
        setSelectedCity(validProv);
        setCurrentView("city");
        setSearchQuery("");
      } else {
        showToast(t.alertCityNotCovered);
      }
    }
  };

  // === FUNZIONI GOOGLE AUTH ===
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Pre-compila il form col nome di Google
      setAuthForm((prev) => ({ ...prev, name: result.user.displayName || "" }));
      showToast("Accesso effettuato! Completa il profilo.");
    } catch (error) {
      console.error("Google Auth Error", error);
      showToast("Errore di accesso. Riprova.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    showToast("Scollegato con successo!");
    setShowAuthModal(false);
    // Torniamo anonimi per poter continuare a leggere i locali degli altri
    signInAnonymously(auth).catch((e) => console.error(e));
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (currentUser && authForm.residenceCity !== currentUser.residenceCity) {
      const changesCount = currentUser.provinceChangesCount || 0;
      if (changesCount >= 1) {
        showToast(t.provinceLocked);
        return;
      }

      const proceed = window.confirm(t.confirmProvinceChange);
      if (!proceed) {
        setAuthForm({ ...authForm, residenceCity: currentUser.residenceCity });
        return;
      }

      const userVotes = currentUser.votedPlaces || [];
      for (const placeId of userVotes) {
        const place = places.find((p) => p.id === placeId);
        if (place) {
          if (place.votes <= 1) {
            await deleteDoc(
              doc(
                db,
                "artifacts",
                databaseId,
                "public",
                "data",
                "places",
                placeId
              )
            );
          } else {
            const newComments = (place.comments || []).filter(
              (c) => c.userId !== user.uid
            );
            await updateDoc(
              doc(
                db,
                "artifacts",
                databaseId,
                "public",
                "data",
                "places",
                placeId
              ),
              {
                votes: increment(-1),
                comments: newComments,
              }
            );
          }
        }
      }

      const newProfileData = {
        name: authForm.name,
        residenceCity: authForm.residenceCity.trim(),
        votedPlaces: [],
        provinceChangesCount: changesCount + 1,
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
        await setDoc(pRef, newProfileData);
      }

      setCurrentUser(newProfileData);
      setShowAuthModal(false);
      showToast(t.provinceChangedSuccess);
      return;
    }

    const cityToSave = currentUser
      ? currentUser.residenceCity
      : authForm.residenceCity;
    if (authForm.name && cityToSave) {
      const profileData = {
        name: authForm.name,
        residenceCity: cityToSave.trim(),
        votedPlaces: currentUser ? currentUser.votedPlaces || [] : [],
        provinceChangesCount: currentUser
          ? currentUser.provinceChangesCount || 0
          : 0,
      };

      if (user) {
        try {
          const pRef = doc(
            db,
            "artifacts",
            databaseId,
            "users",
            user.uid,
            "profile",
            "data"
          );
          await setDoc(pRef, profileData);
        } catch (error) {}
      }

      setCurrentUser(profileData);
      setShowAuthModal(false);
      showToast("Profilo salvato! ✅");
    }
  };

  const handleAddPlaceClick = () => {
    if (!currentUser) {
      showToast(t.alertNeedAuthSuggest);
      setShowAuthModal(true);
      return;
    }
    const userVotes = currentUser.votedPlaces || [];
    if (userVotes.length >= 5) {
      showToast(t.alertVoteLimit);
      return;
    }

    setNewPlace({ ...newPlace, city: currentUser.residenceCity });
    setImagePreview(null);
    setPossibleDuplicates([]);
    setCurrentView("add");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const checkForDuplicates = (inputName) => {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, " ");
    const ignoreWords = [
      "trattoria",
      "pizzeria",
      "osteria",
      "ristorante",
      "bar",
      "da",
      "il",
      "la",
      "lo",
      "le",
      "i",
      "un",
      "una",
      "di",
      "del",
      "della",
    ];
    const inputWords = normalize(inputName)
      .split(" ")
      .filter((w) => w.length > 2 && !ignoreWords.includes(w));

    if (inputWords.length === 0) {
      setPossibleDuplicates([]);
      return;
    }

    const duplicates = places.filter((p) => {
      if (p.city.toLowerCase() !== currentUser?.residenceCity?.toLowerCase())
        return false;
      const pWords = normalize(p.name).split(" ");
      return inputWords.some((iw) => pWords.includes(iw));
    });

    setPossibleDuplicates(duplicates);
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

    const userVotes = currentUser.votedPlaces || [];
    if (userVotes.length >= 5) {
      showToast(t.alertVoteLimit);
      return;
    }

    const newEntry = {
      ...newPlace,
      votes: 1,
      imageUrl: imagePreview || getRandomImage(newPlace.type),
      creatorId: user ? user.uid : null,
      creatorName: currentUser ? currentUser.name : "Un Local",
      comments: [],
    };

    let newPlaceId = Date.now().toString();

    if (user) {
      try {
        const placesRef = collection(
          db,
          "artifacts",
          databaseId,
          "public",
          "data",
          "places"
        );
        const docRef = await addDoc(placesRef, newEntry);
        newPlaceId = docRef.id;

        const newVotesArray = [...userVotes, newPlaceId];
        const profileRef = doc(
          db,
          "artifacts",
          databaseId,
          "users",
          user.uid,
          "profile",
          "data"
        );
        await updateDoc(profileRef, { votedPlaces: newVotesArray });
      } catch (error) {}
    }

    const newVotesArray = [...userVotes, newPlaceId];
    setPlaces([...places, { ...newEntry, id: newPlaceId }]);
    setCurrentUser({ ...currentUser, votedPlaces: newVotesArray });

    showToast(t.alertThanks);

    setSelectedCity(currentUser.residenceCity);
    setCurrentView("city");
    setFilterType("All");

    setNewPlace({
      name: "",
      city: "",
      type: "Ristorante",
      description: "",
      address: "",
    });
    setImagePreview(null);
    setPossibleDuplicates([]);
  };

  const handleDeletePlace = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;

    if (user) {
      try {
        await deleteDoc(
          doc(db, "artifacts", databaseId, "public", "data", "places", id)
        );

        const userVotes = currentUser.votedPlaces || [];
        if (userVotes.includes(id)) {
          const newVotesArray = userVotes.filter((v) => v !== id);
          const profileRef = doc(
            db,
            "artifacts",
            databaseId,
            "users",
            user.uid,
            "profile",
            "data"
          );
          await updateDoc(profileRef, { votedPlaces: newVotesArray });
          setCurrentUser({ ...currentUser, votedPlaces: newVotesArray });
        }
      } catch (error) {}
    }

    setPlaces(places.filter((p) => p.id !== id));
    showToast(t.placeDeleted);
  };

  const handleUpdatePlace = async (e) => {
    e.preventDefault();
    if (!placeToEdit) return;

    if (user) {
      try {
        const placeRef = doc(
          db,
          "artifacts",
          databaseId,
          "public",
          "data",
          "places",
          placeToEdit.id
        );
        await updateDoc(placeRef, {
          name: placeToEdit.name,
          type: placeToEdit.type,
          address: placeToEdit.address,
          description: placeToEdit.description,
        });
      } catch (error) {}
    }

    setPlaces(
      places.map((p) =>
        p.id === placeToEdit.id ? { ...p, ...placeToEdit } : p
      )
    );
    setPlaceToEdit(null);
    showToast(t.changesSaved);
  };

  const handleVoteClick = (id) => {
    const place = places.find((p) => p.id === id);
    if (!currentUser) {
      showToast(t.alertNeedAuthVote);
      setShowAuthModal(true);
      return;
    }
    if (place.city.toLowerCase() !== currentUser.residenceCity.toLowerCase()) {
      showToast(`${t.alertWrongCityVote} ${currentUser.residenceCity}.`);
      return;
    }

    const userVotes = currentUser.votedPlaces || [];
    const isAlreadyVoted = userVotes.includes(id);

    if (isAlreadyVoted) {
      removeVote(place, userVotes);
    } else {
      if (userVotes.length >= 5) {
        showToast(t.alertVoteLimit);
        return;
      }
      setSupportComment("");
      setPlaceToSupport(place);
    }
  };

  const removeVote = async (place, userVotes) => {
    const newVotesArray = userVotes.filter((vId) => vId !== place.id);

    if (place.votes <= 1) {
      showToast(t.voteRemoved);
      if (user) {
        try {
          await deleteDoc(
            doc(
              db,
              "artifacts",
              databaseId,
              "public",
              "data",
              "places",
              place.id
            )
          );
          await updateDoc(
            doc(
              db,
              "artifacts",
              databaseId,
              "users",
              user.uid,
              "profile",
              "data"
            ),
            { votedPlaces: newVotesArray }
          );
        } catch (error) {}
      }
      setPlaces(places.filter((p) => p.id !== place.id));
      setCurrentUser({ ...currentUser, votedPlaces: newVotesArray });
    } else {
      showToast(t.voteRemoved);
      const newComments = (place.comments || []).filter(
        (c) => c.userId !== user.uid
      );

      if (user) {
        try {
          await updateDoc(
            doc(
              db,
              "artifacts",
              databaseId,
              "public",
              "data",
              "places",
              place.id
            ),
            {
              votes: increment(-1),
              comments: newComments,
            }
          );
          await updateDoc(
            doc(
              db,
              "artifacts",
              databaseId,
              "users",
              user.uid,
              "profile",
              "data"
            ),
            { votedPlaces: newVotesArray }
          );
        } catch (error) {}
      }
      setPlaces(
        places.map((p) =>
          p.id === place.id
            ? { ...p, votes: p.votes - 1, comments: newComments }
            : p
        )
      );
      setCurrentUser({ ...currentUser, votedPlaces: newVotesArray });
    }
  };

  const confirmSupport = async (e) => {
    e.preventDefault();
    if (!placeToSupport || !currentUser) return;

    const userVotes = currentUser.votedPlaces || [];
    const newVotesArray = [...userVotes, placeToSupport.id];

    const newComments = [...(placeToSupport.comments || [])];
    if (supportComment.trim()) {
      newComments.push({
        userId: user.uid,
        userName: currentUser.name,
        text: supportComment.trim(),
      });
    }

    showToast(t.voteAdded);

    if (user) {
      try {
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
          {
            votes: increment(1),
            comments: newComments,
          }
        );
        await updateDoc(
          doc(
            db,
            "artifacts",
            databaseId,
            "users",
            user.uid,
            "profile",
            "data"
          ),
          { votedPlaces: newVotesArray }
        );
      } catch (error) {}
    }

    setPlaces(
      places.map((p) =>
        p.id === placeToSupport.id
          ? { ...p, votes: p.votes + 1, comments: newComments }
          : p
      )
    );
    setCurrentUser({ ...currentUser, votedPlaces: newVotesArray });
    setPlaceToSupport(null);

    if (currentView === "add") {
      setSelectedCity(currentUser.residenceCity);
      setCurrentView("city");
      setNewPlace({
        name: "",
        city: "",
        type: "Ristorante",
        description: "",
        address: "",
      });
      setPossibleDuplicates([]);
    }
  };

  const cityTop10 = useMemo(() => {
    if (!selectedCity) return [];
    let filtered = places.filter((p) => p.city === selectedCity);
    if (filterType !== "All")
      filtered = filtered.filter((p) => p.type === filterType);
    return filtered.sort((a, b) => b.votes - a.votes).slice(0, 10);
  }, [places, selectedCity, filterType]);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-stone-500 font-bold animate-pulse">
          Avvio CiboDiZona...
        </p>
      </div>
    );
  }

  const changesCount = currentUser?.provinceChangesCount || 0;
  const canChangeProvince = !currentUser || changesCount < 1;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90vw]">
          <div className="bg-stone-900 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center justify-center gap-3 text-sm sm:text-base border border-stone-700">
            <Bell size={20} className="text-orange-400 shrink-0" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full mr-1 sm:mr-2 border border-stone-200">
              <button
                onClick={() => setLanguage("it")}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${
                  language === "it"
                    ? "bg-white shadow-sm scale-110"
                    : "opacity-50 hover:opacity-100 grayscale"
                }`}
              >
                🇮🇹
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${
                  language === "en"
                    ? "bg-white shadow-sm scale-110"
                    : "opacity-50 hover:opacity-100 grayscale"
                }`}
              >
                🇬🇧
              </button>
            </div>

            {currentUser ? (
              <div
                onClick={() => {
                  setAuthForm({
                    name: currentUser.name,
                    residenceCity: currentUser.residenceCity,
                  });
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-2 mr-1 sm:mr-2 bg-orange-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-orange-200 transition-colors"
              >
                <UserCircle size={18} className="text-orange-600" />
                <span className="text-sm font-bold text-orange-800 hidden sm:inline">
                  {currentUser.name} (
                  {5 - (currentUser.votedPlaces?.length || 0)})
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-orange-600 transition-colors mr-1 sm:mr-2"
              >
                <UserCircle size={20} />
                <span className="hidden sm:inline">{t.becomeLocal}</span>
              </button>
            )}
            <button
              onClick={handleAddPlaceClick}
              className="flex items-center gap-1 text-sm font-semibold text-orange-600 border-2 border-orange-200 bg-orange-50 px-3 sm:px-4 py-2 rounded-full hover:bg-orange-100 transition-colors shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.suggestPlace}</span>
              <span className="sm:hidden">{t.suggest}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {currentView === "home" && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-orange-500 rounded-[2rem] p-8 sm:p-14 text-center text-white shadow-2xl mb-12 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-6 inline-block bg-[#FFF7ED] px-6 py-2 rounded-full shadow-sm">
                  <span className="text-xl sm:text-2xl font-black tracking-tight">
                    <span className="text-orange-500">Cibo</span>
                    <span className="text-green-800">DiZona</span>
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
                  {t.heroTitle1} <br className="sm:hidden" /> {t.heroTitle2}
                </h1>
                <p className="text-orange-50 text-base sm:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  {t.heroSubtitle}
                </p>

                <form
                  onSubmit={handleSearch}
                  className="max-w-2xl mx-auto relative flex items-center"
                >
                  <MapPin
                    className="absolute left-4 sm:left-5 text-orange-500 z-10"
                    size={24}
                  />
                  <input
                    type="text"
                    placeholder={t.wherePlaceholder}
                    className="w-full pl-11 pr-24 sm:pl-14 sm:pr-36 py-3.5 sm:py-5 rounded-full text-stone-800 text-sm sm:text-xl font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all placeholder:text-stone-400 truncate"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 sm:right-3 bg-stone-900 text-white px-4 sm:px-8 py-2 sm:py-3.5 rounded-full font-bold text-sm sm:text-lg hover:bg-stone-800 transition-colors shadow-lg active:scale-95"
                  >
                    {t.searchBtn}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Star
                  className="text-orange-500 drop-shadow-sm shrink-0"
                  fill="currentColor"
                  size={26}
                />
                <h2 className="text-2xl sm:text-3xl font-black text-stone-800">
                  {t.whereAreYou}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {availableCities.map((city) => {
                  const cityPlaces = places.filter((p) => p.city === city);
                  const coverImage = cityPlaces.sort(
                    (a, b) => b.votes - a.votes
                  )[0]?.imageUrl;

                  return (
                    <div
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCurrentView("city");
                        setFilterType("All");
                      }}
                      className="bg-white rounded-[1.5rem] p-3 shadow-md hover:shadow-xl cursor-pointer transition-all group overflow-hidden border border-stone-100"
                    >
                      <div className="h-44 sm:h-40 rounded-2xl overflow-hidden mb-4 relative">
                        <img
                          src={coverImage || defaultFoodImage}
                          alt={city}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-3xl font-black text-white">
                          {city}
                        </h3>
                      </div>
                      <div className="px-3 pb-2 flex justify-between items-center">
                        <p className="text-stone-500 font-medium text-sm sm:text-base">
                          <span className="font-bold text-orange-600">
                            {cityPlaces.length}
                          </span>{" "}
                          {t.recommendedPlaces}
                        </p>
                        <div className="bg-orange-50 text-orange-600 p-2 rounded-full group-hover:bg-orange-100 transition-colors">
                          <Navigation size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === "city" && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setCurrentView("home")}
              className="text-stone-500 hover:text-stone-800 font-bold mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm w-fit transition-colors text-sm sm:text-base"
            >
              {t.backToMap}
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-stone-900 mb-4 tracking-tight leading-normal sm:leading-tight">
                  {t.top10Of} <br className="sm:hidden" />
                  <span className="text-orange-600 bg-orange-100 px-3 py-1.5 rounded-xl inline-block mt-2 sm:mt-0">
                    {selectedCity}
                  </span>
                </h1>
                <p className="text-stone-500 text-base sm:text-lg flex items-start gap-2.5 font-medium leading-relaxed">
                  <ShieldCheck
                    size={20}
                    className="text-orange-400 mt-0.5 shrink-0"
                  />{" "}
                  {t.rankingInfo}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                {["All", "Ristorante", "Street Food"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2.5 sm:px-6 rounded-full text-sm font-bold transition-all flex-grow sm:flex-grow-0 text-center border ${
                      filterType === type
                        ? "bg-stone-900 text-white border-stone-900 shadow-md scale-105"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50 shadow-sm"
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
              {cityTop10.length > 0 ? (
                cityTop10.map((place, index) => {
                  const isVotedByMe = (currentUser?.votedPlaces || []).includes(
                    place.id
                  );
                  const isCreator =
                    currentUser && place.creatorId === user?.uid;
                  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    place.name + " " + place.city
                  )}`;

                  return (
                    <div
                      key={place.id}
                      className="bg-white rounded-[2rem] p-4 shadow-md border border-stone-100 flex flex-col sm:flex-row gap-5 sm:gap-6 relative group hover:shadow-lg transition-shadow"
                    >
                      {isCreator && (
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                          <button
                            onClick={() => setPlaceToEdit(place)}
                            className="bg-white/90 backdrop-blur text-stone-500 p-2.5 rounded-xl shadow-sm hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Modifica"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePlace(place.id)}
                            className="bg-white/90 backdrop-blur text-stone-500 p-2.5 rounded-xl shadow-sm hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Elimina"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      <div className="absolute top-6 left-6 z-10 sm:hidden">
                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md font-black text-lg text-orange-600 border border-white/50">
                          #{index + 1}
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-center justify-center w-16 shrink-0">
                        <span
                          className={`text-6xl font-black drop-shadow-sm ${
                            index === 0
                              ? "text-yellow-400"
                              : index === 1
                              ? "text-stone-300"
                              : index === 2
                              ? "text-amber-600"
                              : "text-stone-200"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      <div className="w-full sm:w-64 h-56 sm:h-auto shrink-0 overflow-hidden rounded-[1.5rem] relative bg-stone-100">
                        <img
                          src={place.imageUrl || defaultFoodImage}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2 pr-16">
                              <span
                                className={`text-[11px] sm:text-xs font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wide ${
                                  place.type === "Ristorante"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {place.type === "Ristorante"
                                  ? t.restaurant
                                  : t.streetFood}
                              </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight mb-2.5 mt-2">
                              {place.name}
                            </h2>

                            <a
                              href={googleMapsLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stone-500 hover:text-orange-600 text-sm font-medium flex items-start gap-1.5 leading-relaxed transition-colors w-fit group/map mt-1"
                            >
                              <MapPin size={16} className="shrink-0 mt-0.5" />
                              <span className="underline decoration-transparent group-hover/map:decoration-orange-600">
                                {place.address || place.city}
                              </span>
                            </a>
                          </div>
                        </div>

                        <p className="text-stone-700 text-base sm:text-lg mt-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50 font-medium leading-relaxed">
                          "{place.description}"
                        </p>

                        {/* PULSANTE LEGGI COMMENTI */}
                        {place.creatorName && (
                          <button
                            onClick={() => setViewingCommentsFor(place)}
                            className="mt-4 flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold text-sm bg-white border border-stone-200 px-4 py-2 rounded-xl w-fit transition-colors shadow-sm"
                          >
                            <MessageCircle size={16} />
                            {t.readComments} (
                            {place.comments?.length
                              ? place.comments.length + 1
                              : 1}
                            )
                          </button>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center justify-center sm:justify-center gap-3 sm:min-w-[8rem] sm:w-auto shrink-0 bg-stone-50 rounded-[1.5rem] p-4 sm:p-3 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleVoteClick(place.id)}
                          className={`text-white p-4 sm:p-3 rounded-2xl shadow-lg transition-all active:scale-90 flex items-center justify-center
                          ${
                            isVotedByMe
                              ? "bg-green-500 hover:bg-red-500 shadow-green-200"
                              : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-1 shadow-orange-200"
                          }`}
                          title={
                            isVotedByMe
                              ? "Ritira il tuo consiglio"
                              : "Aggiungi ai tuoi consigli"
                          }
                        >
                          {isVotedByMe ? (
                            <div className="relative group/btn h-6 w-6 flex items-center justify-center">
                              <ThumbsUp
                                className="absolute fill-white group-hover/btn:opacity-0 transition-opacity"
                                size={24}
                              />
                              <X
                                className="absolute text-white opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                size={24}
                              />
                            </div>
                          ) : (
                            <ThumbsUp className="fill-white" size={24} />
                          )}
                        </button>

                        <div className="text-center mt-1">
                          <span className="block font-black text-2xl text-stone-800 leading-none mb-1">
                            {place.votes}
                          </span>
                          <span className="block text-[10px] sm:text-[11px] text-stone-500 font-bold uppercase tracking-wider leading-tight break-words">
                            {t.localVotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-stone-200 border-dashed">
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">
                    {t.noPlacesFound}
                  </h3>
                  <p className="text-stone-500 text-lg">{t.beFirstLocal}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "add" && (
          <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setCurrentView("home")}
              className="text-stone-500 hover:text-stone-800 font-bold mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm w-fit transition-colors text-sm sm:text-base"
            >
              {t.cancel}
            </button>

            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-stone-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-100 text-green-600 p-3 sm:p-4 rounded-2xl shadow-inner shrink-0">
                  <Camera
                    fill="currentColor"
                    className="text-green-200"
                    size={28}
                  />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                    {t.suggestTitle}
                  </h2>
                  <p className="text-stone-500 font-medium text-sm sm:text-lg mt-1 leading-relaxed">
                    {t.suggestSubtitle} {currentUser?.residenceCity}.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddPlace} className="space-y-6">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    {t.photoLabel}
                  </label>
                  <div className="relative group border-2 border-dashed border-stone-300 rounded-[1.5rem] overflow-hidden hover:border-orange-500 transition-colors bg-stone-50 h-48 sm:h-56 flex flex-col items-center justify-center text-center px-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Anteprima"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    ) : (
                      <div className="z-10 flex flex-col items-center">
                        <ImageIcon size={40} className="text-stone-300 mb-3" />
                        <p className="text-stone-600 font-semibold text-sm sm:text-base">
                          {t.photoPlaceholder}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                  </div>
                </div>

                <div className="mb-4 relative">
                  <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    {t.autoFillLabel}
                  </label>
                  <div className="relative">
                    <input
                      ref={googleInputRef}
                      type="text"
                      placeholder={t.googleSearchPlaceholder}
                      className="w-full border-2 border-blue-200 bg-blue-50/50 rounded-2xl pl-11 pr-4 py-3.5 focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base font-bold outline-none placeholder:text-blue-400 text-blue-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                    />
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                      size={18}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 my-8 opacity-80">
                  <div className="h-px bg-stone-300 flex-1"></div>
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-500 text-center normal-case px-2">
                    {t.orEnterManually}
                  </span>
                  <div className="h-px bg-stone-300 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 ml-1 uppercase">
                      {t.placeNamePlaceholder}
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full border-2 border-stone-200 rounded-2xl px-5 py-4 focus:border-orange-500 transition-all text-base sm:text-lg font-medium outline-none"
                      value={newPlace.name}
                      onChange={(e) => {
                        setNewPlace({ ...newPlace, name: e.target.value });
                        checkForDuplicates(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 ml-1 uppercase">
                      {t.addressPlaceholder}
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-stone-200 rounded-2xl px-5 py-4 focus:border-orange-500 transition-all text-base sm:text-lg font-medium outline-none"
                      value={newPlace.address}
                      onChange={(e) =>
                        setNewPlace({ ...newPlace, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                {possibleDuplicates.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mt-3 animate-in slide-in-from-top-2">
                    <p className="text-orange-800 font-bold text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} className="shrink-0" />{" "}
                      {t.duplicateWarning}
                    </p>
                    <div className="space-y-2">
                      {possibleDuplicates.map((dup) => (
                        <div
                          key={dup.id}
                          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-orange-100"
                        >
                          <span className="font-bold text-stone-800 text-sm truncate pr-2">
                            {dup.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVoteClick(dup.id)}
                            className="shrink-0 bg-stone-900 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-stone-800 transition-colors"
                          >
                            {t.supportThis}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                  <input
                    required
                    disabled
                    type="text"
                    className="w-full border-2 border-stone-200 rounded-2xl px-5 py-4 bg-stone-100 text-stone-500 text-base sm:text-lg font-medium"
                    value={newPlace.city}
                  />
                  <select
                    className="w-full border-2 border-stone-200 rounded-2xl px-5 py-4 focus:border-orange-500 bg-white transition-all text-base sm:text-lg font-medium outline-none"
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
                  rows={4}
                  placeholder={t.whyGoPlaceholder}
                  className="w-full border-2 border-stone-200 rounded-2xl px-5 py-4 focus:border-orange-500 transition-all resize-none text-base sm:text-lg font-medium outline-none mt-2"
                  value={newPlace.description}
                  onChange={(e) =>
                    setNewPlace({ ...newPlace, description: e.target.value })
                  }
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-black text-white font-black text-lg py-4 sm:py-5 rounded-2xl shadow-xl transition-all mt-4"
                >
                  {t.publishBtn}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal Aggiungi Commento Voto */}
      {placeToSupport && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setPlaceToSupport(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 bg-stone-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6 mt-2">
              <h2 className="text-2xl font-black text-stone-900 mb-1">
                {t.leaveCommentTitle}
              </h2>
              <p className="text-stone-500 font-medium text-sm sm:text-base leading-relaxed">
                {t.leaveCommentSubtitle}
              </p>
            </div>
            <form onSubmit={confirmSupport} className="space-y-4">
              <textarea
                rows={3}
                placeholder={t.leaveCommentPlaceholder}
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-orange-500 transition-all resize-none font-medium outline-none"
                value={supportComment}
                onChange={(e) => setSupportComment(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-lg py-4 rounded-xl shadow-lg mt-2 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} /> {t.confirmVoteBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Leggi Commenti */}
      {viewingCommentsFor && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-orange-50 sm:rounded-[2rem] rounded-t-[2rem] w-full max-w-xl shadow-2xl relative h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col">
            <div className="p-6 bg-white rounded-t-[2rem] border-b border-stone-100 shrink-0">
              <button
                onClick={() => setViewingCommentsFor(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 bg-stone-100 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black text-stone-900 pr-10">
                {t.commentsModalTitle}
              </h2>
              <p className="text-orange-600 font-bold">
                {viewingCommentsFor.name}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-stone-100 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-orange-100 text-orange-600 p-1.5 rounded-full">
                    <Award size={16} />
                  </div>
                  <span className="font-black text-stone-900">
                    {viewingCommentsFor.creatorName || "Un Local"}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">
                    {t.creatorTag}
                  </span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed">
                  "{viewingCommentsFor.description}"
                </p>
              </div>

              {viewingCommentsFor.comments &&
                viewingCommentsFor.comments.length > 0 &&
                viewingCommentsFor.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-stone-100 relative"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                        <ThumbsUp size={16} />
                      </div>
                      <span className="font-black text-stone-900">
                        {comment.userName || "Un Local"}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">
                        {t.supporterTag}
                      </span>
                    </div>
                    <p className="text-stone-700 font-medium leading-relaxed">
                      "{comment.text}"
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifica Segnalazione (Creatore) */}
      {placeToEdit && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPlaceToEdit(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 bg-stone-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-6 mt-2 text-stone-900 flex items-center gap-2">
              <Edit2 size={24} className="text-orange-500" /> {t.editPlaceTitle}
            </h2>
            <form onSubmit={handleUpdatePlace} className="space-y-4">
              <input
                required
                type="text"
                placeholder={t.placeNamePlaceholder}
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 font-medium focus:border-orange-500 outline-none"
                value={placeToEdit.name}
                onChange={(e) =>
                  setPlaceToEdit({ ...placeToEdit, name: e.target.value })
                }
              />

              <select
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-orange-500 bg-white transition-all font-medium outline-none"
                value={placeToEdit.type}
                onChange={(e) =>
                  setPlaceToEdit({ ...placeToEdit, type: e.target.value })
                }
              >
                <option value="Ristorante">{t.restaurant}</option>
                <option value="Street Food">{t.streetFood}</option>
              </select>

              <input
                type="text"
                placeholder={t.addressPlaceholder}
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-orange-500 transition-all font-medium outline-none"
                value={placeToEdit.address}
                onChange={(e) =>
                  setPlaceToEdit({ ...placeToEdit, address: e.target.value })
                }
              />

              <textarea
                required
                rows={4}
                placeholder={t.whyGoPlaceholder}
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 focus:border-orange-500 transition-all resize-none font-medium outline-none"
                value={placeToEdit.description}
                onChange={(e) =>
                  setPlaceToEdit({
                    ...placeToEdit,
                    description: e.target.value,
                  })
                }
              ></textarea>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg mt-2 transition-colors"
              >
                {t.saveChanges}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Autenticazione */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-900 bg-stone-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            {!user || user.isAnonymous ? (
              // STATO 1: NON LOGGATO CON GOOGLE
              <div className="text-center mb-4 mt-2">
                <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-md border border-stone-100">
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.434 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.434 53.529 C -21.734 52.629 -21.934 51.679 -21.934 50.689 C -21.934 49.699 -21.734 48.749 -21.434 47.849 L -21.434 44.759 L -25.464 44.759 C -26.284 46.619 -26.844 48.569 -26.844 50.689 C -26.844 52.809 -26.284 54.759 -25.464 56.619 L -21.434 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 42.889 C -12.984 42.889 -11.404 43.489 -10.154 44.629 L -6.734 41.039 C -8.804 38.929 -11.514 37.739 -14.754 37.739 C -19.444 37.739 -23.494 40.439 -25.464 44.759 L -21.434 47.849 C -20.534 44.999 -17.884 42.889 -14.754 42.889 Z"
                      />
                    </g>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                  Accedi per continuare
                </h2>
                <p className="text-stone-500 font-medium mt-3 text-sm sm:text-base leading-relaxed">
                  Per garantire l'autenticità dei consigli e prevenire gli
                  abusi, ti chiediamo di identificarti tramite Google.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-stone-200 hover:border-blue-500 hover:bg-blue-50 text-stone-800 font-bold text-lg py-4 rounded-xl shadow-sm mt-8 transition-all flex items-center justify-center gap-3"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.434 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.434 53.529 C -21.734 52.629 -21.934 51.679 -21.934 50.689 C -21.934 49.699 -21.734 48.749 -21.434 47.849 L -21.434 44.759 L -25.464 44.759 C -26.284 46.619 -26.844 48.569 -26.844 50.689 C -26.844 52.809 -26.284 54.759 -25.464 56.619 L -21.434 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 42.889 C -12.984 42.889 -11.404 43.489 -10.154 44.629 L -6.734 41.039 C -8.804 38.929 -11.514 37.739 -14.754 37.739 C -19.444 37.739 -23.494 40.439 -25.464 44.759 L -21.434 47.849 C -20.534 44.999 -17.884 42.889 -14.754 42.889 Z"
                      />
                    </g>
                  </svg>
                  Continua con Google
                </button>
              </div>
            ) : (
              // STATO 2: LOGGATO, DEVE CREARE/MODIFICARE PROFILO
              <>
                <div className="text-center mb-8 mt-2">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <UserCircle size={40} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                    {currentUser ? t.modalTitleEdit : "Completa il Profilo"}
                  </h2>
                  <p className="text-stone-500 font-medium mt-3 text-sm sm:text-base leading-relaxed">
                    {t.modalSubtitle}
                  </p>
                </div>
                <form onSubmit={saveProfile} className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder={t.namePlaceholder}
                    className="w-full border-2 border-stone-200 rounded-xl px-5 py-4 font-medium text-base sm:text-lg focus:border-orange-500 outline-none"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                  />

                  <div className="relative">
                    <select
                      required
                      className={`w-full border-2 border-stone-200 rounded-xl px-5 py-4 font-medium text-base sm:text-lg outline-none appearance-none ${
                        !canChangeProvince
                          ? "bg-stone-100 text-stone-500 cursor-not-allowed"
                          : "focus:border-orange-500 bg-white"
                      }`}
                      value={
                        currentUser
                          ? authForm.residenceCity
                          : authForm.residenceCity
                      }
                      onChange={(e) => {
                        setAuthForm({
                          ...authForm,
                          residenceCity: e.target.value,
                        });
                      }}
                      disabled={!canChangeProvince}
                    >
                      <option value="" disabled>
                        {t.provincePlaceholder}
                      </option>
                      {ITALIAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>

                    {!canChangeProvince && (
                      <Lock
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                    )}

                    {canChangeProvince && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-stone-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {currentUser && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-bold p-2 rounded-lg mt-1 ${
                        canChangeProvince
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <ShieldCheck size={14} className="shrink-0" />
                      <p>
                        {canChangeProvince
                          ? t.provinceWarning
                          : t.provinceLocked}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!user || !authForm.residenceCity}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-lg mt-2 transition-colors"
                  >
                    {t.saveProfile}
                  </button>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                      }}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-base py-3 rounded-xl mt-2 transition-colors"
                    >
                      Scollegati
                    </button>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
