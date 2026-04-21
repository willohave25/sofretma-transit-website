/* ============================================================
   W2K Auto-Scroll Premium
   SOFRETMA TRANSIT | W2K-Digital
   Défilement automatique lent et continu entre pages
   ============================================================ */

const W2KAutoScroll = (() => {

  let config = {
    speed: 'lent',         // lent | moyen | rapide
    inactivityDelay: 45,   // secondes avant reprise après interaction
    showIndicator: true
  };

  // Pixels par frame selon la vitesse
  const vitesses = {
    lent:   0.6,
    moyen:  1.2,
    rapide: 2.0
  };

  let animationId = null;
  let enPause = false;
  let timerReprise = null;
  let indicateur = null;
  let barre = null;
  let pageActuelle = document.body.dataset.nextPage || null;

  /* ---- Création des éléments UI ---- */
  function creerUI() {
    if (config.showIndicator) {
      indicateur = document.createElement('div');
      indicateur.id = 'w2k-indicateur';
      indicateur.title = 'Défilement automatique actif';
      indicateur.classList.add('actif');
      document.body.appendChild(indicateur);
    }

    barre = document.createElement('div');
    barre.id = 'w2k-progression';
    document.body.appendChild(barre);
  }

  /* ---- Mise à jour barre de progression ---- */
  function majBarre() {
    const hauteurDoc  = document.documentElement.scrollHeight - window.innerHeight;
    const progression = hauteurDoc > 0 ? (window.scrollY / hauteurDoc) * 100 : 0;
    if (barre) barre.style.width = progression + '%';
  }

  /* ---- Défilement d'une frame ---- */
  function defilerFrame() {
    if (enPause) return;

    const px = vitesses[config.speed] || vitesses.lent;
    window.scrollBy(0, px);

    majBarre();

    // Fin de page atteinte → page suivante
    const bas = window.innerHeight + window.scrollY;
    const hauteur = document.documentElement.scrollHeight;

    if (bas >= hauteur - 2) {
      allerPageSuivante();
      return;
    }

    animationId = requestAnimationFrame(defilerFrame);
  }

  /* ---- Redirection page suivante ---- */
  function allerPageSuivante() {
    if (!pageActuelle) return;
    cancelAnimationFrame(animationId);
    // Pause courte, puis navigation
    setTimeout(() => {
      window.location.href = pageActuelle;
    }, 500);
  }

  /* ---- Pause sur interaction ---- */
  function mettreEnPause() {
    if (enPause) return;
    enPause = true;
    cancelAnimationFrame(animationId);

    if (indicateur) {
      indicateur.classList.remove('actif');
      indicateur.classList.add('pause');
      indicateur.title = 'Reprise dans ' + config.inactivityDelay + 's';
    }

    clearTimeout(timerReprise);
    timerReprise = setTimeout(reprendre, config.inactivityDelay * 1000);
  }

  /* ---- Reprise après inactivité ---- */
  function reprendre() {
    enPause = false;

    if (indicateur) {
      indicateur.classList.remove('pause');
      indicateur.classList.add('actif');
      indicateur.title = 'Défilement automatique actif';
    }

    animationId = requestAnimationFrame(defilerFrame);
  }

  /* ---- Événements d'interaction ---- */
  function ecouterInteractions() {
    const evenements = ['mousedown', 'wheel', 'touchstart', 'keydown'];
    evenements.forEach(ev => {
      document.addEventListener(ev, mettreEnPause, { passive: true });
    });
  }

  /* ---- Initialisation publique ---- */
  function init(options = {}) {
    config = Object.assign(config, options);

    creerUI();
    ecouterInteractions();

    // Lancement après un bref délai (page chargée)
    setTimeout(() => {
      animationId = requestAnimationFrame(defilerFrame);
    }, 1200);
  }

  return { init };

})();
