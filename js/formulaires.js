/* ============================================================
   Formulaires SOFRETMA TRANSIT
   Envoi WhatsApp (prioritaire) + Brevo email (backup)
   W2K-Digital | formulaires.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const WA_NUMERO = '2250767639063';
  const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

  /* ---- Génération lien WhatsApp ---- */
  function genererLienWhatsApp(categorie, donnees) {
    let message = `Bonjour SOFRETMA TRANSIT,\n\nDemande de devis — ${categorie}\n\n`;

    for (const [cle, valeur] of Object.entries(donnees)) {
      if (valeur) {
        const label = cle
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        message += `• ${label} : ${valeur}\n`;
      }
    }

    message += '\nMerci de me recontacter.';

    return `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(message)}`;
  }

  /* ---- Validation simple ---- */
  function validerFormulaire(form) {
    let valide = true;
    form.querySelectorAll('[required]').forEach(champ => {
      if (!champ.value.trim()) {
        champ.style.borderColor = '#e53e3e';
        valide = false;
      } else {
        champ.style.borderColor = '';
      }
    });
    return valide;
  }

  /* ---- Collecte données formulaire ---- */
  function collecterDonnees(form) {
    const donnees = {};
    new FormData(form).forEach((valeur, cle) => {
      donnees[cle] = valeur;
    });
    return donnees;
  }

  /* ---- Brevo : envoi email de backup ---- */
  async function envoyerBrevo(categorie, donnees) {
    try {
      const corps = Object.entries(donnees)
        .filter(([, v]) => v)
        .map(([k, v]) => `<b>${k}</b>: ${v}`)
        .join('<br>');

      await fetch(BREVO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'VOTRE_CLE_BREVO_ICI' // À remplacer lors de la Phase 2
        },
        body: JSON.stringify({
          sender:   { name: 'Site SOFRETMA TRANSIT', email: 'noreply@sofretmatransit.com' },
          to:       [{ email: 'contact@sofretmatransit.com', name: 'SOFRETMA TRANSIT' }],
          subject:  `Nouvelle demande — ${categorie}`,
          htmlContent: `<h2>Demande ${categorie}</h2>${corps}`
        })
      });
    } catch (e) {
      // Silence — WhatsApp est le canal principal
    }
  }

  /* ---- Gestionnaire générique pour tous les formulaires ---- */
  document.querySelectorAll('[data-categorie]').forEach(form => {
    const categorie = form.dataset.categorie;

    // Bouton WhatsApp
    const btnWhatsApp = form.querySelector('[data-action="whatsapp"]');
    if (btnWhatsApp) {
      btnWhatsApp.addEventListener('click', e => {
        e.preventDefault();
        if (!validerFormulaire(form)) {
          alert('Merci de remplir tous les champs obligatoires.');
          return;
        }
        const donnees = collecterDonnees(form);
        const url = genererLienWhatsApp(categorie, donnees);
        window.open(url, '_blank', 'noopener');
        envoyerBrevo(categorie, donnees);
      });
    }

    // Bouton email backup
    const btnEmail = form.querySelector('[data-action="email"]');
    if (btnEmail) {
      btnEmail.addEventListener('click', async e => {
        e.preventDefault();
        if (!validerFormulaire(form)) {
          alert('Merci de remplir tous les champs obligatoires.');
          return;
        }
        const donnees = collecterDonnees(form);
        await envoyerBrevo(categorie, donnees);
        alert('Votre message a bien été envoyé. Nous vous répondrons rapidement !');
        form.reset();
      });
    }

    // Suppression highlight rouge à la saisie
    form.querySelectorAll('.formulaire__champ').forEach(champ => {
      champ.addEventListener('input', () => {
        champ.style.borderColor = '';
      });
    });
  });

  /* ---- Formulaire de contact simple (contact.html) ---- */
  const formContact = document.getElementById('form-contact');
  if (formContact) {
    formContact.addEventListener('submit', e => {
      e.preventDefault();
      if (!validerFormulaire(formContact)) {
        alert('Merci de remplir tous les champs obligatoires.');
        return;
      }
      const donnees = collecterDonnees(formContact);
      const url = genererLienWhatsApp('Contact général', donnees);
      window.open(url, '_blank', 'noopener');
      envoyerBrevo('Contact général', donnees);
      formContact.reset();
      alert('Merci ! Votre message a été transmis. Nous vous répondrons très prochainement.');
    });
  }

});
