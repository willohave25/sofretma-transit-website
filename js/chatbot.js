/* ============================================================
   Sofretma Assistant — Chatbot côté client
   SOFRETMA TRANSIT | W2K-Digital
   Navigation par catégories, réponses préprogrammées
   ============================================================ */

(function () {

  /* ---- Base de connaissances ---- */
  const BASE = {
    accueil: {
      label: '🏠 Accueil',
      questions: [
        {
          q: "Qu'est-ce que SOFRETMA TRANSIT ?",
          r: "SOFRETMA TRANSIT est une société de transit international basée à Abidjan (Côte d'Ivoire), spécialisée dans le fret maritime, aérien, ferroviaire, routier, le dédouanement et les services logistiques."
        },
        {
          q: "Quels sont vos horaires ?",
          r: "Nous sommes disponibles du lundi au vendredi de 8h à 18h et le samedi de 9h à 13h. En dehors de ces heures, vous pouvez nous contacter par WhatsApp."
        },
        {
          q: "Comment vous contacter ?",
          r: "📞 +225 01 02 02 01 79\n💬 WhatsApp : +225 07 67 63 90 63\n📧 contact@sofretmatransit.com\n📍 Abidjan Cocody Anono"
        }
      ]
    },
    maritime: {
      label: '⚓ Maritime',
      questions: [
        {
          q: "Quelles sont vos destinations maritimes ?",
          r: "Depuis le Port d'Abidjan, nous assurons des connexions vers l'Europe (France, Belgique, Pays-Bas), l'Amérique du Nord (Canada), l'Asie (Chine, Inde, Corée du Sud) et les pays d'Afrique de l'Ouest."
        },
        {
          q: "Proposez-vous le FCL et le LCL ?",
          r: "Oui ! Nous proposons le FCL (Full Container Load) pour les volumes complets et le LCL (groupage) pour les envois plus modestes. Contactez-nous pour un devis personnalisé."
        },
        {
          q: "Gérez-vous le dédouanement ?",
          r: "Absolument. SOFRETMA TRANSIT est commissionnaire agréé. Nous prenons en charge toutes les formalités douanières au Port Autonome d'Abidjan et à l'arrivée."
        }
      ]
    },
    aerien: {
      label: '✈️ Aérien',
      questions: [
        {
          q: "Quelles destinations aériennes couvrez-vous ?",
          r: "Depuis l'Aéroport Félix Houphouët-Boigny d'Abidjan, nous couvrons Paris, Bruxelles, Amsterdam, Montréal, Toronto, Dubaï, ainsi que plusieurs hubs asiatiques et africains."
        },
        {
          q: "Gérez-vous les colis urgents ?",
          r: "Oui, le fret aérien est notre solution pour les envois urgents, les colis périssables, les équipements industriels et le matériel médical. Délais fiables et traçabilité complète."
        },
        {
          q: "Quel est le délai pour le fret aérien ?",
          r: "Les délais varient selon la destination. En général : Europe en 3-5 jours ouvrables, Amérique du Nord en 4-6 jours. Contactez-nous pour un délai précis selon votre expédition."
        }
      ]
    },
    ferroviaire: {
      label: '🚂 Ferroviaire',
      questions: [
        {
          q: "Sur quelles lignes intervenez-vous ?",
          r: "Nous opérons sur la ligne Abidjan – Bouaké – Ouagadougou via le réseau SITARAIL, avec des liaisons régulières adaptées aux volumes de marchandises."
        },
        {
          q: "Quels types de marchandises transportez-vous ?",
          r: "Le ferroviaire est idéal pour les marchandises en vrac, les conteneurs et les véhicules. Particulièrement adapté aux flux réguliers entre Abidjan et le Burkina Faso."
        }
      ]
    },
    terrestre: {
      label: '🚛 Terrestre',
      questions: [
        {
          q: "Quels pays desservez-vous ?",
          r: "Nous desservons le Mali, Burkina Faso, Guinée, Sénégal, Ghana, Togo, Bénin et Niger. Nos corridors principaux : Abidjan–Lagos et Abidjan–Ouagadougou–Dakar."
        },
        {
          q: "Quelle est votre flotte de camions ?",
          r: "Notre flotte comprend des camions 8T, 20T, 30T et des semi-remorques, adaptés aux marchandises générales, conteneurs et marchandises lourdes."
        }
      ]
    },
    achats: {
      label: '🛒 Bureau d\'achats',
      questions: [
        {
          q: "Depuis quels pays importez-vous ?",
          r: "Nous gérons vos importations depuis la Chine, l'Europe, la Turquie/Moyen-Orient, les États-Unis et le Canada. Recherche fournisseurs, contrôle qualité, documentation et expédition inclus."
        },
        {
          q: "Quels produits gérez-vous ?",
          r: "Nous traitons les denrées alimentaires, textiles, électronique, équipements industriels, matériaux de construction et marchandises générales."
        }
      ]
    },
    voyages: {
      label: '✈️ Voyages',
      questions: [
        {
          q: "Quels services de voyage proposez-vous ?",
          r: "Billets d'avion, réservations d'hôtels, voyages d'affaires, assistance visa, et accompagnement complet pour vos déplacements professionnels et personnels."
        }
      ]
    },
    assurances: {
      label: '🛡️ Assurances',
      questions: [
        {
          q: "Quels types de colis assurez-vous ?",
          r: "Nous assurons tous types : véhicules et gros engins, colis vestimentaires, équipements informatiques, matériel médical, produits agricoles et marchandises générales."
        },
        {
          q: "L'assurance est-elle obligatoire ?",
          r: "Elle n'est pas obligatoire mais fortement recommandée. Elle protège vos marchandises contre la perte, le vol, la casse et les délais critiques."
        }
      ]
    },
    prestations: {
      label: '📋 Prestations',
      questions: [
        {
          q: "Quelles prestations offrez-vous ?",
          r: "Dédouanement portuaire et aéroportuaire, planification d'acheminement, documentation export-import, gestion des litiges douaniers et conseil en réglementation."
        }
      ]
    }
  };

  /* ---- Création du HTML chatbot ---- */
  function creerInterface() {
    const html = `
      <button id="chatbot-bulle" aria-label="Ouvrir Sofretma Assistant">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </button>

      <div id="chatbot-panneau" role="dialog" aria-label="Sofretma Assistant">
        <div class="chatbot__header">
          <div class="chatbot__header-info">
            <div class="chatbot__avatar">🤝</div>
            <div>
              <div class="chatbot__nom">Sofretma Assistant</div>
              <div class="chatbot__statut">Disponible 24h/24</div>
            </div>
          </div>
          <button class="chatbot__fermer" id="chatbot-fermer" aria-label="Fermer">✕</button>
        </div>

        <div class="chatbot__messages" id="chatbot-messages"></div>

        <div class="chatbot__categories" id="chatbot-categories"></div>

        <div class="chatbot__saisie">
          <input type="text" class="chatbot__input" id="chatbot-input"
                 placeholder="Posez votre question…" autocomplete="off">
          <button class="chatbot__envoyer" id="chatbot-envoyer" aria-label="Envoyer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    const conteneur = document.createElement('div');
    conteneur.innerHTML = html;
    document.body.appendChild(conteneur);
  }

  /* ---- Ajouter un message ---- */
  function ajouterMessage(texte, type) {
    const zone = document.getElementById('chatbot-messages');
    const msg = document.createElement('div');
    msg.className = 'msg msg--' + type;
    msg.textContent = texte;
    zone.appendChild(msg);
    zone.scrollTop = zone.scrollHeight;
  }

  /* ---- Afficher les sous-questions d'une catégorie ---- */
  function afficherSousQuestions(cleCategorie) {
    const cat = BASE[cleCategorie];
    if (!cat) return;

    ajouterMessage(cat.questions.map((q, i) => (i + 1) + '. ' + q.q).join('\n'), 'bot');

    const zone = document.getElementById('chatbot-categories');
    zone.innerHTML = '';

    cat.questions.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.textContent = (i + 1) + '. ' + item.q.substring(0, 30) + '…';
      btn.addEventListener('click', () => {
        ajouterMessage(item.q, 'user');
        setTimeout(() => ajouterMessage(item.r, 'bot'), 300);
        reinitialiserCategories();
      });
      zone.appendChild(btn);
    });

    // Bouton retour
    const retour = document.createElement('button');
    retour.className = 'cat-btn';
    retour.textContent = '← Retour';
    retour.addEventListener('click', reinitialiserCategories);
    zone.appendChild(retour);
  }

  /* ---- Réinitialiser les boutons de catégories ---- */
  function reinitialiserCategories() {
    const zone = document.getElementById('chatbot-categories');
    zone.innerHTML = '';

    Object.entries(BASE).forEach(([cle, cat]) => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        ajouterMessage('Je souhaite des infos sur : ' + cat.label, 'user');
        setTimeout(() => afficherSousQuestions(cle), 300);
      });
      zone.appendChild(btn);
    });
  }

  /* ---- Réponse à une saisie libre ---- */
  function traiterSaisieLibre(texte) {
    const t = texte.toLowerCase();
    let reponse = null;

    for (const [, cat] of Object.entries(BASE)) {
      for (const item of cat.questions) {
        if (t.split(' ').some(mot => item.q.toLowerCase().includes(mot) && mot.length > 3)) {
          reponse = item.r;
          break;
        }
      }
      if (reponse) break;
    }

    if (!reponse) {
      reponse = "Pour cette demande, contactez-nous directement sur WhatsApp 👇";
      const lien = document.createElement('a');
      lien.href = 'https://wa.me/2250767639063?text=' + encodeURIComponent('Bonjour SOFRETMA TRANSIT, ' + texte);
      lien.target = '_blank';
      lien.rel = 'noopener';
      lien.textContent = '💬 Écrire sur WhatsApp';
      lien.style.cssText = 'display:block;margin-top:8px;color:#25D366;font-weight:700;';

      setTimeout(() => {
        const zone = document.getElementById('chatbot-messages');
        const msg = zone.lastElementChild;
        if (msg) msg.appendChild(lien);
      }, 350);
    }

    ajouterMessage(reponse, 'bot');
  }

  /* ---- Initialisation ---- */
  function init() {
    creerInterface();

    const bulle   = document.getElementById('chatbot-bulle');
    const panneau = document.getElementById('chatbot-panneau');
    const fermer  = document.getElementById('chatbot-fermer');
    const input   = document.getElementById('chatbot-input');
    const envoyer = document.getElementById('chatbot-envoyer');

    // Message de bienvenue
    ajouterMessage(
      "Bonjour ! Je suis le Sofretma Assistant 👋\n" +
      "Comment puis-je vous aider aujourd'hui ?\n" +
      "Sélectionnez une catégorie ou posez directement votre question.",
      'bot'
    );

    reinitialiserCategories();

    // Ouverture / Fermeture
    bulle.addEventListener('click', () => {
      panneau.classList.toggle('ouvert');
      bulle.style.display = panneau.classList.contains('ouvert') ? 'none' : 'flex';
    });

    fermer.addEventListener('click', () => {
      panneau.classList.remove('ouvert');
      bulle.style.display = 'flex';
    });

    // Envoi saisie
    function envoyerMessage() {
      const texte = input.value.trim();
      if (!texte) return;
      ajouterMessage(texte, 'user');
      input.value = '';
      setTimeout(() => traiterSaisieLibre(texte), 300);
    }

    envoyer.addEventListener('click', envoyerMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') envoyerMessage(); });
  }

  // Lancement au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
