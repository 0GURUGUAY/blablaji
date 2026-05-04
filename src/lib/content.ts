import { routeOptions } from "@/lib/data";
import type { Locale } from "@/lib/locale";
import type {
  Conversation,
  ModerationCase,
  ProductPillar,
  Review,
  Ride,
  RideStatus,
  TrustMetric,
} from "@/lib/types";

type SiteContent = {
  navigation: {
    home: string;
    trips: string;
    publish: string;
    messages: string;
    admin: string;
  };
  languageNames: Record<Locale, string>;
  rideLabels: {
    departure: string;
    seats: string;
    driver: string;
    vehicle: string;
    suggestedPrice: string;
    freeSeatsSuffix: string;
    tripCountSuffix: string;
    bookButton: string;
    status: Record<RideStatus, string>;
  };
  roleLabels: {
    driver: string;
    passenger: string;
  };
  moderationLabels: {
    severity: Record<ModerationCase["severity"], string>;
    status: Record<ModerationCase["status"], string>;
  };
  home: {
    badge: string;
    title: string;
    description: string;
    searchCta: string;
    publishCta: string;
    searchCard: {
      origin: string;
      destination: string;
      date: string;
      seats: string;
      maxPrice: string;
      dateValue: string;
      action: string;
      caption: string;
    };
    tripsEyebrow: string;
    tripsTitle: string;
    tripsDescription: string;
    pillarEyebrow: string;
    authEyebrow: string;
    authTitle: string;
    email: string;
    password: string;
    signIn: string;
    signUp: string;
    authDescription: string;
    signedInAs: string;
    authSuccess: string;
    authCheckEmail: string;
    authSignOut: string;
    authSubmitIdle: string;
    authSubmitLoading: string;
    reviewsEyebrow: string;
    reviewsTitle: string;
    reviewsDescription: string;
  };
  trips: {
    eyebrow: string;
    title: string;
    description: string;
    offersEyebrow: string;
    offersTitle: string;
    offersDescription: string;
    offersLoading: string;
    offersEmpty: string;
    offersAuth: string;
    catalogLoading: string;
    catalogEmpty: string;
    catalogError: string;
    catalogFallback: string;
    origin: string;
    destination: string;
    date: string;
    maxPrice: string;
    preferences: string;
    preferenceOptions: string[];
    apply: string;
    resultsEyebrow: string;
    resultsTitle: string;
    sortLabel: string;
  };
  publish: {
    eyebrow: string;
    title: string;
    description: string;
    vehicleCta: string;
    loading: string;
    authRequired: string;
    loadError: string;
    saveError: string;
    vehicleRequiredTitle: string;
    vehicleRequiredDescription: string;
    currentVehicle: string;
    seatsHelp: string;
    submitIdle: string;
    submitLoading: string;
    success: string;
    steps: string[];
    origin: string;
    destination: string;
    date: string;
    time: string;
    seats: string;
    suggestedPrice: string;
    vehicle: string;
    details: string;
    detailsValue: string;
    tags: string[];
    submit: string;
  };
  vehicleProfile: {
    eyebrow: string;
    title: string;
    description: string;
    helperTitle: string;
    helperDescription: string;
    checklist: string[];
    loading: string;
    authRequired: string;
    loadError: string;
    saveError: string;
    brand: string;
    model: string;
    color: string;
    plateNumber: string;
    seats: string;
    luggagePolicy: string;
    insuranceProvider: string;
    policyNumber: string;
    insuranceExpiry: string;
    insuranceDocument: string;
    insuranceDocumentHint: string;
    submit: string;
    success: string;
  };
  messages: {
    eyebrow: string;
    title: string;
    description: string;
    activeConversation: string;
    activeTitle: string;
    sampleMessages: string[];
    placeholder: string;
    send: string;
  };
  admin: {
    eyebrow: string;
    title: string;
    description: string;
    accessLoading: string;
    accessDeniedTitle: string;
    accessDeniedDescription: string;
    accessDeniedHint: string;
    accessGranted: string;
    headers: {
      subject: string;
      reason: string;
      severity: string;
      opened: string;
      status: string;
    };
  };
  featuredRides: Ride[];
  conversations: Conversation[];
  reviews: Review[];
  moderationCases: ModerationCase[];
  trustMetrics: TrustMetric[];
  productPillars: ProductPillar[];
};

const localizedContent: Record<Locale, SiteContent> = {
  es: {
    navigation: { home: "Inicio", trips: "Viajes", publish: "Publicar", messages: "Mensajes", admin: "Admin" },
    languageNames: { es: "ES", fr: "FR" },
    rideLabels: {
      departure: "Salida",
      seats: "Asientos",
      driver: "Conductor",
      vehicle: "Vehiculo",
      suggestedPrice: "Precio sugerido",
      freeSeatsSuffix: "libres",
      tripCountSuffix: "viajes",
      bookButton: "Reservar un asiento",
      status: { available: "Disponible", full: "Completo", lastSeats: "Ultimos asientos" },
    },
    roleLabels: { driver: "Conductor", passenger: "Pasajero" },
    moderationLabels: {
      severity: { low: "Baja", medium: "Media", high: "Alta" },
      status: { review: "En revision", escalated: "Escalado", closed: "Cerrado" },
    },
    home: {
      badge: "Version local para Jose Ignacio",
      title: "Los viajes compartidos pensados para los trayectos de la costa uruguaya.",
      description: "Busqueda, publicacion, reserva, mensajeria, opiniones y moderacion. Una base completa para lanzar un servicio de viajes compartidos local, adaptado a la escala de Jose Ignacio.",
      searchCta: "Buscar un viaje",
      publishCta: "Publicar como conductor",
      searchCard: {
        origin: "Salida",
        destination: "Destino",
        date: "Fecha",
        seats: "Asientos",
        maxPrice: "Precio maximo",
        dateValue: "Hoy",
        action: "Iniciar busqueda inteligente",
        caption: "La v1 ya esta lista para conectar una API de matching, pagos locales y una app movil mas adelante.",
      },
      tripsEyebrow: "Viajes",
      tripsTitle: "Los trayectos mas utiles de esta semana",
      tripsDescription: "Una seleccion de viajes creibles para la vida diaria, los regresos de la playa, la temporada alta y los desplazamientos hacia Maldonado o Punta del Este.",
      pillarEyebrow: "Pilar de producto",
      authEyebrow: "Autenticacion",
      authTitle: "Acceso simple para conductores y pasajeros",
      email: "Email",
      password: "Contrasena",
      signIn: "Iniciar sesion",
      signUp: "Crear cuenta",
      authDescription: "Usa tu correo y una contrasena para entrar o crear tu cuenta. La integracion real con Supabase Auth ya esta lista.",
      signedInAs: "Conectado como",
      authSuccess: "Sesion iniciada correctamente.",
      authCheckEmail: "Cuenta creada. Revisa tu email para confirmar el acceso si Supabase lo solicita.",
      authSignOut: "Cerrar sesion",
      authSubmitIdle: "Continuar con email",
      authSubmitLoading: "Enviando...",
      reviewsEyebrow: "Opiniones",
      reviewsTitle: "La confianza se construye viaje tras viaje",
      reviewsDescription: "Opiniones visibles, moderacion local y perfil detallado del conductor para aumentar la adopcion sin sobrecargar la v1.",
    },
    trips: {
      eyebrow: "Busqueda",
      title: "Encontrar el viaje correcto",
      description: "Filtros simples para validar rapido la necesidad local antes de sumar un motor de matching avanzado.",
      offersEyebrow: "Tus ofertas",
      offersTitle: "Los rides que ya publicaste",
      offersDescription: "Aqui aparecen tus trayectos reales guardados en la base. Los ejemplos simulados siguen visibles mas abajo por ahora.",
      offersLoading: "Cargando tus rides publicados...",
      offersEmpty: "Todavia no tienes rides publicados. Crea uno desde Publicar para verlo aqui.",
      offersAuth: "Inicia sesion para ver tus rides publicados.",
      catalogLoading: "Cargando rides disponibles...",
      catalogEmpty: "No encontramos rides para estos filtros.",
      catalogError: "No pudimos cargar el catalogo real por ahora.",
      catalogFallback: "Mostramos ejemplos temporales mientras terminamos de poblar la base.",
      origin: "Salida",
      destination: "Destino",
      date: "Fecha",
      maxPrice: "Precio maximo",
      preferences: "Preferencias",
      preferenceOptions: ["Equipaje", "Silencio", "Mascotas", "Surf", "Pago en efectivo"],
      apply: "Aplicar filtros",
      resultsEyebrow: "Resultados",
      resultsTitle: "12 viajes sugeridos",
      sortLabel: "Orden: mejor calificacion del conductor",
    },
    publish: {
      eyebrow: "Conductores",
      title: "Publicar un viaje en menos de un minuto",
      description: "El flujo de publicacion se mantiene simple a proposito para validar rapido el mercado local antes de sumar recorridos recurrentes, pagos y verificacion automatizada.",
      vehicleCta: "Registrar vehiculo y seguro",
      loading: "Cargando tus datos de conductor...",
      authRequired: "Inicia sesion para publicar un viaje real en la base de datos.",
      loadError: "No se pudo cargar tu vehiculo guardado.",
      saveError: "No se pudo publicar el viaje.",
      vehicleRequiredTitle: "Necesitas registrar un vehiculo antes de publicar",
      vehicleRequiredDescription: "Tu auto guardado aparecera aqui automaticamente y se usara para crear el viaje en la base.",
      currentVehicle: "Vehiculo registrado",
      seatsHelp: "No puede superar los asientos disponibles de tu vehiculo.",
      submitIdle: "Publicar viaje",
      submitLoading: "Publicando...",
      success: "Viaje publicado correctamente en la base de datos.",
      steps: ["Seleccion del viaje y el horario", "Precio sugerido en UYU", "Preferencias de equipaje y comodidad", "Validacion del vehiculo y cantidad de asientos"],
      origin: "Salida",
      destination: "Destino",
      date: "Fecha",
      time: "Hora",
      seats: "Asientos",
      suggestedPrice: "Precio sugerido",
      vehicle: "Vehiculo",
      details: "Detalles del viaje",
      detailsValue: "Salida desde la estacion de servicio en la entrada de Jose Ignacio. Valija pequena o mochila, sin equipamiento grande.",
      tags: ["Musica tranquila", "Sin cigarrillo", "Mascotas permitidas", "Tablas de surf OK"],
      submit: "Publicar viaje",
    },
    vehicleProfile: {
      eyebrow: "Vehiculo",
      title: "Registrar tu auto y la cobertura de seguro",
      description: "Completa los datos del vehiculo una sola vez para acelerar despues la publicacion de trayectos y la validacion del conductor.",
      helperTitle: "Documentacion recomendada",
      helperDescription: "Una ficha clara del auto reduce validaciones manuales y hace mas simple revisar la cobertura antes de aprobar conductores frecuentes.",
      checklist: ["Matricula visible y correcta", "Cantidad real de asientos disponibles", "Compania de seguros activa", "Vencimiento del seguro actualizado"],
      loading: "Cargando tu vehiculo...",
      authRequired: "Inicia sesion para guardar y editar tu vehiculo en la base de datos.",
      loadError: "No se pudo cargar tu vehiculo actual.",
      saveError: "No se pudo guardar el vehiculo.",
      brand: "Marca",
      model: "Modelo",
      color: "Color",
      plateNumber: "Matricula",
      seats: "Asientos disponibles",
      luggagePolicy: "Politica de equipaje",
      insuranceProvider: "Compania de seguros",
      policyNumber: "Numero de poliza",
      insuranceExpiry: "Vencimiento del seguro",
      insuranceDocument: "Comprobante de seguro",
      insuranceDocumentHint: "PDF, foto o captura del comprobante actual.",
      submit: "Guardar vehiculo",
      success: "Vehiculo listo. La ficha queda preparada para conectarla despues a Supabase y al upload de documentos.",
    },
    messages: {
      eyebrow: "Mensajeria",
      title: "Coordinar antes de la salida",
      description: "Una interfaz simple para confirmar el punto de encuentro, el equipaje y el horario antes de cada viaje.",
      activeConversation: "Conversacion activa",
      activeTitle: "Sofia · Jose Ignacio a Punta del Este",
      sampleMessages: ["Hola, llevare una tabla de surf pequena. Entra sin problema?", "Si, sin problema. Nos encontramos en la estacion a las 18:00 para salir a las 18:10.", "Perfecto. Pago en efectivo al llegar."],
      placeholder: "Escribir un mensaje...",
      send: "Enviar",
    },
    admin: {
      eyebrow: "Moderacion",
      title: "Panel de confianza y soporte",
      description: "Vista admin para tratar reportes, monitorear la calidad de los viajes y verificar perfiles sensibles.",
      accessLoading: "Verificando acceso admin...",
      accessDeniedTitle: "Acceso restringido",
      accessDeniedDescription: "Esta vista esta reservada a las cuentas admin de la aplicacion.",
      accessDeniedHint: "Conectate con max.patissier@gmail.com para entrar al panel.",
      accessGranted: "Acceso admin validado",
      headers: { subject: "Asunto", reason: "Motivo", severity: "Severidad", opened: "Abierto", status: "Estado" },
    },
    featuredRides: [
      { id: "ride-001", origin: "Jose Ignacio", destination: "Punta del Este", dateLabel: "Hoy", departureTime: "18:10", seatsLeft: 2, priceUyu: 320, driverName: "Lucia S.", driverRating: 4.9, driverTrips: 128, carModel: "Suzuki Vitara", status: "lastSeats", tags: ["Aire acondicionado", "Tablas de surf OK", "Musica tranquila"] },
      { id: "ride-002", origin: "La Barra", destination: "Jose Ignacio", dateLabel: "Manana", departureTime: "09:00", seatsLeft: 3, priceUyu: 220, driverName: "Tomas R.", driverRating: 4.8, driverTrips: 89, carModel: "Toyota Corolla", status: "available", tags: ["Equipaje de mano", "Conversacion"] },
      { id: "ride-003", origin: "San Carlos", destination: "Jose Ignacio", dateLabel: "Viernes", departureTime: "07:30", seatsLeft: 1, priceUyu: 260, driverName: "Mateo P.", driverRating: 4.7, driverTrips: 61, carModel: "Chevrolet Onix", status: "lastSeats", tags: ["Trayecto al trabajo", "Puntual"] },
      { id: "ride-004", origin: "Jose Ignacio", destination: "Maldonado", dateLabel: "Sabado", departureTime: "15:45", seatsLeft: 4, priceUyu: 350, driverName: "Camila V.", driverRating: 5, driverTrips: 42, carModel: "Volkswagen T-Cross", status: "available", tags: ["Playa", "Mascotas permitidas"] },
    ],
    conversations: [
      { id: "conv-001", riderName: "Sofia", role: "passenger", route: "Jose Ignacio -> Punta del Este", lastMessage: "Puedo llevar una mochila pequena y una tabla corta?", lastTimestamp: "Hace 12 min", unread: 2 },
      { id: "conv-002", riderName: "Nicolas", role: "driver", route: "La Barra -> Jose Ignacio", lastMessage: "Estare frente a la panaderia a las 8:55.", lastTimestamp: "Hace 1 h", unread: 0 },
      { id: "conv-003", riderName: "Valentina", role: "passenger", route: "San Carlos -> Jose Ignacio", lastMessage: "Gracias, reserva confirmada.", lastTimestamp: "Ayer", unread: 0 },
    ],
    reviews: [
      { id: "review-001", author: "Agustin", rating: 5, route: "Punta del Este -> Jose Ignacio", body: "Viaje muy facil de reservar, conductor puntual y pago al llegar sin sorpresas." },
      { id: "review-002", author: "Clara", rating: 5, route: "Jose Ignacio -> Maldonado", body: "La mensajeria antes de salir me dio tranquilidad y el punto de encuentro fue muy claro." },
      { id: "review-003", author: "Martin", rating: 4, route: "La Barra -> Jose Ignacio", body: "Muy buena experiencia local. Solo me gustaria ver mas viajes muy temprano entre semana." },
    ],
    moderationCases: [
      { id: "case-001", subject: "Viaje ride-003", reason: "Queja por retraso sin mensaje previo", severity: "medium", openedAt: "Hoy, 08:05", status: "review" },
      { id: "case-002", subject: "Perfil Lucia S.", reason: "Verificacion de licencia y seguro", severity: "low", openedAt: "Ayer, 19:20", status: "closed" },
      { id: "case-003", subject: "Conversacion conv-001", reason: "Reporte por tono inapropiado", severity: "high", openedAt: "Ayer, 17:10", status: "escalated" },
    ],
    trustMetrics: [
      { label: "Ocupacion media", value: "83%", detail: "en los ultimos 7 dias" },
      { label: "Tiempo de respuesta", value: "9 min", detail: "en la mensajeria antes de salir" },
      { label: "Perfiles verificados", value: "91%", detail: "telefono e identidad verificados" },
      { label: "Calificaciones 4+", value: "96%", detail: "en viajes completados" },
    ],
    productPillars: [
      { title: "Movilidad ultra local", description: "Viajes pensados para Jose Ignacio, La Barra, San Carlos, Maldonado y las necesidades estacionales de la zona." },
      { title: "Confianza antes que velocidad", description: "Verificacion de perfiles, calificaciones, moderacion y mensajeria clara antes de cada reserva." },
      { title: "Arquitectura lista para mobile", description: "Modelos de dominio simples para conectar despues una API, una app movil y pagos en linea." },
    ],
  },
  fr: {
    navigation: { home: "Accueil", trips: "Trajets", publish: "Publier", messages: "Messages", admin: "Admin" },
    languageNames: { es: "ES", fr: "FR" },
    rideLabels: {
      departure: "Depart",
      seats: "Places",
      driver: "Conducteur",
      vehicle: "Vehicule",
      suggestedPrice: "Prix suggere",
      freeSeatsSuffix: "libres",
      tripCountSuffix: "trajets",
      bookButton: "Reserver une place",
      status: { available: "Disponible", full: "Complet", lastSeats: "Dernieres places" },
    },
    roleLabels: { driver: "Conducteur", passenger: "Passager" },
    moderationLabels: {
      severity: { low: "Faible", medium: "Moyenne", high: "Elevee" },
      status: { review: "En revue", escalated: "Escalade", closed: "Clos" },
    },
    home: {
      badge: "Version locale pour Jose Ignacio",
      title: "Le covoiturage pense pour les trajets de la cote uruguayenne.",
      description: "Recherche, publication, reservation, messagerie, avis et moderation. Une base complete pour lancer un service de covoiturage local, adapte a l'echelle de Jose Ignacio.",
      searchCta: "Chercher un trajet",
      publishCta: "Publier comme conducteur",
      searchCard: {
        origin: "Depart",
        destination: "Destination",
        date: "Date",
        seats: "Places",
        maxPrice: "Prix max",
        dateValue: "Aujourd'hui",
        action: "Lancer la recherche intelligente",
        caption: "La v1 est prete pour brancher une API de matching, du paiement local et une application mobile plus tard.",
      },
      tripsEyebrow: "Trajets",
      tripsTitle: "Les parcours les plus utiles cette semaine",
      tripsDescription: "Une selection de trajets credibles pour la vie quotidienne, les retours de plage, les saisons hautes et les deplacements vers Maldonado ou Punta del Este.",
      pillarEyebrow: "Pilier produit",
      authEyebrow: "Authentification",
      authTitle: "Connexion simple pour conducteurs et passagers",
      email: "Email",
      password: "Mot de passe",
      signIn: "Se connecter",
      signUp: "Creer un compte",
      authDescription: "Utilise ton email et un mot de passe pour te connecter ou creer ton compte. L'integration reelle avec Supabase Auth est maintenant prete.",
      signedInAs: "Connecte en tant que",
      authSuccess: "Connexion reussie.",
      authCheckEmail: "Compte cree. Verifie ton email pour confirmer l'acces si Supabase le demande.",
      authSignOut: "Se deconnecter",
      authSubmitIdle: "Continuer avec email",
      authSubmitLoading: "Envoi...",
      reviewsEyebrow: "Avis",
      reviewsTitle: "La confiance se construit trajet apres trajet",
      reviewsDescription: "Avis visibles, moderation locale et profil conducteur detaille pour augmenter l'adoption sans surcomplexifier la v1.",
    },
    trips: {
      eyebrow: "Recherche",
      title: "Trouver le bon trajet",
      description: "Filtres simples pour valider vite le besoin local avant d'ajouter un moteur de matching avance.",
      offersEyebrow: "Tes offres",
      offersTitle: "Les rides que tu as deja publies",
      offersDescription: "Tes vrais trajets enregistres en base s'affichent ici. Les exemples fictifs restent visibles plus bas pour l'instant.",
      offersLoading: "Chargement de tes rides publies...",
      offersEmpty: "Tu n'as pas encore de ride publie. Cree-en un depuis Publier pour le voir ici.",
      offersAuth: "Connecte-toi pour voir tes rides publies.",
      catalogLoading: "Chargement des rides disponibles...",
      catalogEmpty: "Aucun ride ne correspond a ces filtres.",
      catalogError: "Impossible de charger le catalogue reel pour l'instant.",
      catalogFallback: "On affiche des exemples temporaires pendant la phase de remplissage de la base.",
      origin: "Depart",
      destination: "Destination",
      date: "Date",
      maxPrice: "Prix max",
      preferences: "Preferences",
      preferenceOptions: ["Bagages", "Silence", "Animaux", "Surf", "Paiement cash"],
      apply: "Appliquer les filtres",
      resultsEyebrow: "Resultats",
      resultsTitle: "12 trajets proposes",
      sortLabel: "Tri: meilleure note conducteur",
    },
    publish: {
      eyebrow: "Conducteurs",
      title: "Publier un trajet en moins d'une minute",
      description: "Le flux de publication reste volontairement simple pour tester vite le marche local avant d'ajouter disponibilites recurrentes, paiement et verification automatisee.",
      vehicleCta: "Enregistrer vehicule et assurance",
      loading: "Chargement de tes donnees conducteur...",
      authRequired: "Connecte-toi pour publier un vrai trajet dans la base de donnees.",
      loadError: "Impossible de charger ton vehicule enregistre.",
      saveError: "Impossible de publier le trajet.",
      vehicleRequiredTitle: "Tu dois enregistrer un vehicule avant de publier",
      vehicleRequiredDescription: "Ta voiture enregistree apparaitra ici automatiquement et sera utilisee pour creer le trajet en base.",
      currentVehicle: "Vehicule enregistre",
      seatsHelp: "Ne peut pas depasser le nombre de places disponibles dans ton vehicule.",
      submitIdle: "Publier le trajet",
      submitLoading: "Publication...",
      success: "Trajet publie correctement dans la base de donnees.",
      steps: ["Selection du trajet et de l'horaire", "Prix suggere en UYU", "Preferences bagages et confort", "Validation du vehicule et nombre de places"],
      origin: "Depart",
      destination: "Destination",
      date: "Date",
      time: "Heure",
      seats: "Places",
      suggestedPrice: "Prix suggere",
      vehicle: "Vehicule",
      details: "Details du trajet",
      detailsValue: "Depart depuis la station-service a l'entree de Jose Ignacio. Petite valise ou sac a dos, pas de gros equipements.",
      tags: ["Musique douce", "Pas de cigarette", "Animaux acceptes", "Surfboards OK"],
      submit: "Publier le trajet",
    },
    vehicleProfile: {
      eyebrow: "Vehicule",
      title: "Enregistrer ta voiture et la couverture d'assurance",
      description: "Renseigne les informations du vehicule une fois pour accelerer ensuite la publication des trajets et la validation conducteur.",
      helperTitle: "Documents recommandes",
      helperDescription: "Une fiche vehicule claire reduit les verifications manuelles et facilite le controle de la couverture avant validation.",
      checklist: ["Plaque visible et correcte", "Nombre reel de places disponibles", "Compagnie d'assurance active", "Date d'expiration du contrat a jour"],
      loading: "Chargement de ton vehicule...",
      authRequired: "Connecte-toi pour enregistrer et modifier ton vehicule dans la base.",
      loadError: "Impossible de charger ton vehicule actuel.",
      saveError: "Impossible d'enregistrer le vehicule.",
      brand: "Marque",
      model: "Modele",
      color: "Couleur",
      plateNumber: "Plaque",
      seats: "Places disponibles",
      luggagePolicy: "Politique bagages",
      insuranceProvider: "Compagnie d'assurance",
      policyNumber: "Numero de police",
      insuranceExpiry: "Expiration de l'assurance",
      insuranceDocument: "Justificatif d'assurance",
      insuranceDocumentHint: "PDF, photo ou capture du justificatif en cours.",
      submit: "Enregistrer le vehicule",
      success: "Vehicule pret. La fiche est deja structuree pour etre connectee ensuite a Supabase et a l'upload de documents.",
    },
    messages: {
      eyebrow: "Messagerie",
      title: "Coordonner avant le depart",
      description: "Une interface simple pour confirmer le point de rendez-vous, les bagages et le timing avant chaque trajet.",
      activeConversation: "Conversation active",
      activeTitle: "Sofia · Jose Ignacio vers Punta del Este",
      sampleMessages: ["Salut, j'aurai une petite planche de surf. Ca rentre ?", "Oui, sans probleme. On se retrouve a la station a 18:00 pour partir a 18:10.", "Parfait. Je paie en cash a l'arrivee."],
      placeholder: "Ecrire un message...",
      send: "Envoyer",
    },
    admin: {
      eyebrow: "Moderation",
      title: "Tableau de bord confiance et support",
      description: "Vue admin pour traiter les signalements, surveiller la qualite des trajets et verifier les profils sensibles.",
      accessLoading: "Verification de l'acces admin...",
      accessDeniedTitle: "Acces restreint",
      accessDeniedDescription: "Cette vue est reservee aux comptes admin de l'application.",
      accessDeniedHint: "Connecte-toi avec max.patissier@gmail.com pour ouvrir le panneau.",
      accessGranted: "Acces admin valide",
      headers: { subject: "Sujet", reason: "Motif", severity: "Severite", opened: "Ouvert", status: "Statut" },
    },
    featuredRides: [
      { id: "ride-001", origin: "Jose Ignacio", destination: "Punta del Este", dateLabel: "Aujourd'hui", departureTime: "18:10", seatsLeft: 2, priceUyu: 320, driverName: "Lucia S.", driverRating: 4.9, driverTrips: 128, carModel: "Suzuki Vitara", status: "lastSeats", tags: ["Climatisation", "Surfboards OK", "Musique douce"] },
      { id: "ride-002", origin: "La Barra", destination: "Jose Ignacio", dateLabel: "Demain", departureTime: "09:00", seatsLeft: 3, priceUyu: 220, driverName: "Tomas R.", driverRating: 4.8, driverTrips: 89, carModel: "Toyota Corolla", status: "available", tags: ["Bagage cabine", "Discussion"] },
      { id: "ride-003", origin: "San Carlos", destination: "Jose Ignacio", dateLabel: "Vendredi", departureTime: "07:30", seatsLeft: 1, priceUyu: 260, driverName: "Mateo P.", driverRating: 4.7, driverTrips: 61, carModel: "Chevrolet Onix", status: "lastSeats", tags: ["Trajet travail", "Ponctuel"] },
      { id: "ride-004", origin: "Jose Ignacio", destination: "Maldonado", dateLabel: "Samedi", departureTime: "15:45", seatsLeft: 4, priceUyu: 350, driverName: "Camila V.", driverRating: 5, driverTrips: 42, carModel: "Volkswagen T-Cross", status: "available", tags: ["Plage", "Animaux acceptes"] },
    ],
    conversations: [
      { id: "conv-001", riderName: "Sofia", role: "passenger", route: "Jose Ignacio -> Punta del Este", lastMessage: "Je peux prendre un petit sac et une planche courte ?", lastTimestamp: "Il y a 12 min", unread: 2 },
      { id: "conv-002", riderName: "Nicolas", role: "driver", route: "La Barra -> Jose Ignacio", lastMessage: "Je serai devant la panaderia a 8:55.", lastTimestamp: "Il y a 1 h", unread: 0 },
      { id: "conv-003", riderName: "Valentina", role: "passenger", route: "San Carlos -> Jose Ignacio", lastMessage: "Merci, reservation confirmee.", lastTimestamp: "Hier", unread: 0 },
    ],
    reviews: [
      { id: "review-001", author: "Agustin", rating: 5, route: "Punta del Este -> Jose Ignacio", body: "Trajet tres simple a reserver, conducteur ponctuel, paiement a l'arrivee sans surprise." },
      { id: "review-002", author: "Clara", rating: 5, route: "Jose Ignacio -> Maldonado", body: "La messagerie avant depart m'a rassuree et le point de rendez-vous etait tres clair." },
      { id: "review-003", author: "Martin", rating: 4, route: "La Barra -> Jose Ignacio", body: "Bonne experience locale. J'aimerais juste plus de trajets tres matinaux en semaine." },
    ],
    moderationCases: [
      { id: "case-001", subject: "Trajet ride-003", reason: "Plainte pour retard sans message", severity: "medium", openedAt: "Aujourd'hui, 08:05", status: "review" },
      { id: "case-002", subject: "Profil Lucia S.", reason: "Verification permis et assurance", severity: "low", openedAt: "Hier, 19:20", status: "closed" },
      { id: "case-003", subject: "Conversation conv-001", reason: "Signalement de ton inapproprie", severity: "high", openedAt: "Hier, 17:10", status: "escalated" },
    ],
    trustMetrics: [
      { label: "Remplissage moyen", value: "83%", detail: "sur les 7 derniers jours" },
      { label: "Temps de reponse", value: "9 min", detail: "dans la messagerie avant depart" },
      { label: "Profils verifies", value: "91%", detail: "telephone et identite controles" },
      { label: "Notes 4+", value: "96%", detail: "sur les trajets completes" },
    ],
    productPillars: [
      { title: "Covoiturage ultra-local", description: "Des trajets penses pour Jose Ignacio, La Barra, San Carlos, Maldonado et les besoins saisonniers du coin." },
      { title: "Confiance avant vitesse", description: "Verification des profils, notes, moderation et messagerie claire avant chaque reservation." },
      { title: "Architecture mobile-ready", description: "Modeles de domaine simples pour brancher ensuite une API, une app mobile et le paiement en ligne." },
    ],
  },
};

export function getLocalizedContent(locale: Locale) {
  return localizedContent[locale];
}

export { routeOptions };