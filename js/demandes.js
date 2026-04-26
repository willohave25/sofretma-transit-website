/* ============================================================
   SOFRETMA TRANSIT — Espace Client / Formulaires de demande
   Soumission vers l'API REST + affichage référence dossier
   W2K-Digital | demandes.js
   ============================================================ */

(function () {

  const API_BASE = 'https://api.sofretmatransit.com/api';

  // Vérification connexion (auth-client.js doit être chargé avant)
  if (typeof SofretmaClient !== 'undefined') {
    SofretmaClient.requireLogin();
  }

  /* ---- Collecte des données du formulaire ---- */
  function collecterDonnees(form) {
    const data = {};

    // Inputs, selects, textareas
    form.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select, textarea').forEach(el => {
      if (el.name && el.value.trim() !== '') {
        data[el.name] = el.value.trim();
      }
    });

    // Checkboxes — regroupés par name, valeur = chaîne séparée par virgules
    const cbGroups = {};
    form.querySelectorAll('input[type=checkbox]:checked').forEach(el => {
      if (!cbGroups[el.name]) cbGroups[el.name] = [];
      cbGroups[el.name].push(el.value);
    });
    Object.entries(cbGroups).forEach(([name, vals]) => {
      data[name] = vals.join(', ');
    });

    // Radios
    form.querySelectorAll('input[type=radio]:checked').forEach(el => {
      if (el.name) data[el.name] = el.value;
    });

    return data;
  }

  /* ---- Validation champs obligatoires ---- */
  function valider(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      if (!el.value.trim()) {
        el.style.borderColor = '#e53e3e';
        ok = false;
      } else {
        el.style.borderColor = '';
      }
    });
    // Groupes de checkboxes requis
    form.querySelectorAll('[data-required-group]').forEach(group => {
      const checked = group.querySelectorAll('input[type=checkbox]:checked');
      if (checked.length === 0) {
        group.style.outline = '2px solid #e53e3e';
        ok = false;
      } else {
        group.style.outline = '';
      }
    });
    return ok;
  }

  /* ---- Afficher le message de succès ---- */
  function afficherSucces(container, reference) {
    container.innerHTML = `
      <div style="text-align:center;padding:48px 24px;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-md);">
        <div style="font-size:3rem;margin-bottom:16px;">✅</div>
        <h2 style="color:var(--emeraude);margin-bottom:16px;">Demande enregistrée !</h2>
        <p style="font-size:1.1rem;margin-bottom:8px;">Votre référence dossier :</p>
        <div style="display:inline-block;background:var(--bleu-profond);border:2px solid var(--or);border-radius:var(--radius-sm);padding:12px 32px;margin:8px 0 24px;">
          <span style="font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--or);font-weight:700;letter-spacing:2px;">${reference}</span>
        </div>
        <p style="color:var(--texte-muted);max-width:500px;margin:0 auto 24px;">Un email de confirmation a été envoyé. Notre équipe traitera votre dossier et vous contactera sous 24–48h.</p>
        <a href="espace-client.html" class="btn btn--vert">← Retour à l'espace client</a>
      </div>`;
  }

  /* ---- Afficher un message d'erreur ---- */
  function afficherErreur(zoneMsg, msg) {
    zoneMsg.style.display = 'block';
    zoneMsg.style.background = 'rgba(229,62,62,0.15)';
    zoneMsg.style.border = '1px solid #e53e3e';
    zoneMsg.style.borderRadius = 'var(--radius-sm)';
    zoneMsg.style.padding = '16px';
    zoneMsg.style.marginTop = '16px';
    zoneMsg.style.color = '#fc8181';
    zoneMsg.textContent = msg;
  }

  /* ---- Initialisation formulaire de demande ---- */
  function initFormulaire(formId, type) {
    const form = document.getElementById(formId);
    if (!form) return;

    const btn = form.querySelector('[data-action="soumettre"]');
    const zoneMsg = form.querySelector('[data-zone-message]');
    const container = form.closest('[data-form-container]') || form.parentElement;

    // Reset erreurs à la saisie
    form.addEventListener('input', e => {
      if (e.target.style) e.target.style.borderColor = '';
    });

    if (!btn) return;

    btn.addEventListener('click', async e => {
      e.preventDefault();

      if (!valider(form)) {
        if (zoneMsg) afficherErreur(zoneMsg, 'Merci de remplir tous les champs obligatoires (marqués *).');
        window.scrollTo({ top: form.querySelector('[required]')?.getBoundingClientRect().top + window.scrollY - 100 || 0, behavior: 'smooth' });
        return;
      }

      // Vérification case validation
      const cbValidation = form.querySelector('input[name="validation_acceptation"]');
      if (cbValidation && !cbValidation.checked) {
        if (zoneMsg) afficherErreur(zoneMsg, 'Vous devez accepter les conditions générales pour soumettre votre demande.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      const donnees = collecterDonnees(form);

      try {
        const headers = (typeof SofretmaClient !== 'undefined')
          ? SofretmaClient.authHeaders()
          : { 'Content-Type': 'application/json' };

        const resp = await fetch(`${API_BASE}/demandes/${type}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(donnees)
        });

        const json = await resp.json();

        if (resp.ok && json.reference) {
          afficherSucces(container, json.reference);
        } else {
          btn.disabled = false;
          btn.textContent = 'Envoyer ma demande';
          if (zoneMsg) afficherErreur(zoneMsg, json.erreur || 'Une erreur est survenue. Veuillez réessayer.');
        }
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Envoyer ma demande';
        if (zoneMsg) afficherErreur(zoneMsg, 'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.');
      }
    });
  }

  /* ---- Affichage conditionnel section parc conteneurs ---- */
  function initSectionConteneur() {
    const cbParc = document.querySelector('input[value="Parc à conteneurs"]');
    const sectionParc = document.getElementById('section-parc-conteneur');
    if (!cbParc || !sectionParc) return;

    function toggle() {
      sectionParc.style.display = cbParc.checked ? 'block' : 'none';
    }
    cbParc.addEventListener('change', toggle);
    toggle();
  }

  /* ---- Affichage conditionnel assurance ---- */
  function initSectionAssurance(radioNom, sectionId) {
    const radios = document.querySelectorAll(`input[name="${radioNom}"]`);
    const section = document.getElementById(sectionId);
    if (!radios.length || !section) return;

    function toggle() {
      const val = document.querySelector(`input[name="${radioNom}"]:checked`)?.value;
      section.style.display = val === 'Oui' ? 'block' : 'none';
    }
    radios.forEach(r => r.addEventListener('change', toggle));
    toggle();
  }

  /* ---- Affichage conditionnel fournisseur existant ---- */
  function initFournisseurExistant() {
    const radios = document.querySelectorAll('input[name="fournisseur_existant"]');
    const section = document.getElementById('section-fournisseur-existant');
    if (!radios.length || !section) return;

    function toggle() {
      const val = document.querySelector('input[name="fournisseur_existant"]:checked')?.value;
      section.style.display = val === 'Oui' ? 'block' : 'none';
    }
    radios.forEach(r => r.addEventListener('change', toggle));
    toggle();
  }

  /* ---- Transport sourcing conditionnel ---- */
  function initTransportSourcing() {
    const radios = document.querySelectorAll('input[name="transport"]');
    const section = document.getElementById('section-transport-mode');
    if (!radios.length || !section) return;

    function toggle() {
      const val = document.querySelector('input[name="transport"]:checked')?.value;
      section.style.display = val === 'Oui' ? 'block' : 'none';
    }
    radios.forEach(r => r.addEventListener('change', toggle));
    toggle();
  }

  /* ---- Exposition globale ---- */
  window.DemandesInit = {
    stockage:     () => { initFormulaire('form-demande', 'stockage');     initSectionConteneur();   initSectionAssurance('assurance', 'section-type-assurance'); },
    sourcing:     () => { initFormulaire('form-demande', 'sourcing');     initFournisseurExistant(); initTransportSourcing(); initSectionAssurance('assurance', 'section-type-assurance'); },
    dedouanement: () => { initFormulaire('form-demande', 'dedouanement'); initSectionAssurance('assurance', 'section-type-assurance'); },
    maritime:     () => { initFormulaire('form-demande', 'maritime');     initSectionAssurance('assurance', 'section-type-assurance'); },
    routier:      () => { initFormulaire('form-demande', 'routier');      initSectionAssurance('assurance', 'section-type-assurance'); }
  };

})();
