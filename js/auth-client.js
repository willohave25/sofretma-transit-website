/* ============================================================
   SOFRETMA TRANSIT — Authentification espace client
   W2K-Digital | auth-client.js
   ============================================================ */

(function () {

  const API = 'http://81.17.101.202/api';
  const CLE_TOKEN = 'sofretma_client_token';
  const CLE_USER  = 'sofretma_client_user';

  /* ---- Gestion token ---- */
  function getToken()          { return localStorage.getItem(CLE_TOKEN); }
  function setToken(t)         { localStorage.setItem(CLE_TOKEN, t); }
  function removeToken()       { localStorage.removeItem(CLE_TOKEN); localStorage.removeItem(CLE_USER); }

  function setUser(u)          { localStorage.setItem(CLE_USER, JSON.stringify(u)); }
  function getUser()           {
    try { return JSON.parse(localStorage.getItem(CLE_USER) || 'null'); } catch { return null; }
  }

  function isLoggedIn()        { return !!getToken(); }

  function requireLogin() {
    if (!isLoggedIn()) {
      window.location.href = 'espace-client.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      return false;
    }
    return true;
  }

  function deconnecter() {
    removeToken();
    window.location.href = 'espace-client.html';
  }

  /* ---- Header Auth pour les fetch ---- */
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    };
  }

  /* ============================================================
     GESTION MESSAGES UI
  ============================================================ */
  function afficherMessage(el, msg, type) {
    if (!el) return;
    el.style.display = 'block';
    el.style.padding = '12px 16px';
    el.style.borderRadius = '8px';
    el.style.marginTop = '16px';
    el.style.fontSize = '0.9rem';
    if (type === 'erreur') {
      el.style.background = 'rgba(229,62,62,0.15)';
      el.style.border = '1px solid #e53e3e';
      el.style.color = '#fc8181';
    } else {
      el.style.background = 'rgba(16,185,129,0.15)';
      el.style.border = '1px solid #10b981';
      el.style.color = '#6ee7b7';
    }
    el.textContent = msg;
  }

  /* ============================================================
     FORMULAIRE INSCRIPTION (inscription.html)
  ============================================================ */
  function initInscription() {
    const form = document.getElementById('form-inscription');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const msg = form.querySelector('[data-message]');

      const mdp = form.querySelector('[name="mot_de_passe"]')?.value;
      const mdp2 = form.querySelector('[name="mot_de_passe_confirm"]')?.value;
      if (mdp !== mdp2) {
        return afficherMessage(msg, 'Les mots de passe ne correspondent pas.', 'erreur');
      }

      btn.disabled = true;
      btn.textContent = 'Création en cours…';

      const data = {};
      new FormData(form).forEach((v, k) => { if (k !== 'mot_de_passe_confirm') data[k] = v; });

      try {
        const r = await fetch(`${API}/auth/inscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await r.json();

        if (r.ok) {
          form.innerHTML = `
            <div style="text-align:center;padding:32px;">
              <div style="font-size:3rem;margin-bottom:16px;">📧</div>
              <h3 style="color:var(--emeraude);margin-bottom:12px;">Compte créé avec succès !</h3>
              <p>Un email de confirmation a été envoyé à <strong>${data.email}</strong>.<br>
              Cliquez sur le lien dans l'email pour activer votre compte.</p>
            </div>`;
        } else {
          btn.disabled = false;
          btn.textContent = 'Créer mon compte';
          afficherMessage(msg, json.erreur || 'Erreur lors de la création du compte.', 'erreur');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Créer mon compte';
        afficherMessage(msg, 'Impossible de contacter le serveur. Vérifiez votre connexion.', 'erreur');
      }
    });
  }

  /* ============================================================
     FORMULAIRE CONNEXION (espace-client.html)
  ============================================================ */
  function initConnexion() {
    const form = document.getElementById('form-connexion');
    if (!form) return;

    // Si déjà connecté → mon-compte
    if (isLoggedIn()) {
      window.location.href = 'mon-compte.html';
      return;
    }

    // Message après vérification email
    const params = new URLSearchParams(window.location.search);
    const zoneInfo = document.getElementById('zone-info-auth');
    if (params.get('verified') === '1' && zoneInfo) {
      afficherMessage(zoneInfo, '✅ Compte activé ! Vous pouvez maintenant vous connecter.', 'succes');
    }
    if (params.get('erreur') === 'lien_invalide' && zoneInfo) {
      afficherMessage(zoneInfo, '❌ Lien de confirmation invalide ou expiré. Réinscrivez-vous.', 'erreur');
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const msg = form.querySelector('[data-message]');

      btn.disabled = true;
      btn.textContent = 'Connexion…';

      const data = {
        email: form.querySelector('[name="email"]')?.value?.trim(),
        mot_de_passe: form.querySelector('[name="mot_de_passe"]')?.value
      };

      try {
        const r = await fetch(`${API}/auth/connexion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await r.json();

        if (r.ok && json.token) {
          setToken(json.token);
          setUser(json.user);
          const redirect = params.get('redirect') || 'mon-compte.html';
          window.location.href = redirect;
        } else {
          btn.disabled = false;
          btn.textContent = 'Se connecter';
          afficherMessage(msg, json.erreur || 'Email ou mot de passe incorrect.', 'erreur');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Se connecter';
        afficherMessage(msg, 'Impossible de contacter le serveur.', 'erreur');
      }
    });
  }

  /* ============================================================
     PAGE MON COMPTE (mon-compte.html)
  ============================================================ */
  function initMonCompte() {
    const zone = document.getElementById('zone-mon-compte');
    if (!zone) return;

    if (!requireLogin()) return;

    const user = getUser();

    // Afficher le nom
    const elNom = document.getElementById('compte-nom');
    if (elNom && user) elNom.textContent = `${user.prenom || ''} ${user.nom}`.trim();

    // Bouton déconnexion
    document.querySelectorAll('[data-action="deconnecter"]').forEach(btn => {
      btn.addEventListener('click', deconnecter);
    });

    chargerMesDemandes();
    chargerProfil();
  }

  async function chargerMesDemandes() {
    const zone = document.getElementById('mes-demandes-liste');
    if (!zone) return;

    try {
      const r = await fetch(`${API}/auth/mes-demandes`, { headers: authHeaders() });
      const json = await r.json();

      if (!r.ok || !json.demandes) {
        zone.innerHTML = '<p style="color:var(--texte-muted);">Impossible de charger vos demandes.</p>';
        return;
      }

      if (json.demandes.length === 0) {
        zone.innerHTML = `
          <div style="text-align:center;padding:32px;color:var(--texte-muted);">
            <div style="font-size:2.5rem;margin-bottom:12px;">📭</div>
            <p>Vous n'avez pas encore soumis de demande.</p>
            <a href="espace-client.html#services" class="btn btn--or" style="margin-top:16px;display:inline-block;">Faire une demande</a>
          </div>`;
        return;
      }

      const labels = {
        stockage: 'Stockage & Entreposage', sourcing: 'Sourcing International',
        dedouanement: 'Dédouanement', maritime: 'Transport Maritime', routier: 'Transport Routier'
      };
      const badges = {
        nouveau: 'badge--or', en_cours: 'badge--bleu', traite: 'badge--vert', annule: 'badge--gris'
      };

      zone.innerHTML = json.demandes.map(d => `
        <div style="background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-weight:600;color:var(--or);margin-bottom:4px;">${labels[d.type] || d.type}</div>
            <div style="font-size:0.85rem;color:var(--texte-muted);">Réf : <strong style="color:var(--texte-clair);">${d.reference}</strong> &nbsp;·&nbsp; ${new Date(d.created_at).toLocaleDateString('fr-FR')}</div>
            ${d.notes_admin ? `<div style="font-size:0.8rem;color:var(--bleu-ciel);margin-top:6px;">💬 ${d.notes_admin}</div>` : ''}
          </div>
          <span class="badge ${badges[d.statut] || 'badge--or'}">${d.statut?.replace('_', ' ') || 'nouveau'}</span>
        </div>`).join('');
    } catch {
      zone.innerHTML = '<p style="color:var(--texte-muted);">Erreur de chargement.</p>';
    }
  }

  async function chargerProfil() {
    const form = document.getElementById('form-profil');
    if (!form) return;

    try {
      const r = await fetch(`${API}/auth/moi`, { headers: authHeaders() });
      const user = await r.json();
      if (!r.ok) return;

      ['nom', 'prenom', 'email', 'telephone', 'adresse', 'ville', 'pays'].forEach(k => {
        const el = form.querySelector(`[name="${k}"]`);
        if (el) el.value = user[k] || '';
      });

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const msg = form.querySelector('[data-message]');
        btn.disabled = true;
        btn.textContent = 'Enregistrement…';

        const data = {};
        new FormData(form).forEach((v, k) => { data[k] = v; });

        const resp = await fetch(`${API}/auth/profil`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data)
        });
        const json = await resp.json();
        btn.disabled = false;
        btn.textContent = 'Enregistrer';
        if (resp.ok) {
          setUser({ ...getUser(), ...json });
          afficherMessage(msg, 'Profil mis à jour avec succès.', 'succes');
        } else {
          afficherMessage(msg, json.erreur || 'Erreur.', 'erreur');
        }
      });
    } catch {}
  }

  /* ============================================================
     PROTECTION DES PAGES FORMULAIRES
  ============================================================ */
  function initPageFormulaire() {
    if (!requireLogin()) return;
    // Afficher nom dans le header si présent
    const user = getUser();
    const elBienvenue = document.getElementById('client-bienvenue');
    if (elBienvenue && user) elBienvenue.textContent = `Connecté : ${user.prenom || user.nom}`;

    // Bouton déconnexion
    document.querySelectorAll('[data-action="deconnecter"]').forEach(btn => {
      btn.addEventListener('click', deconnecter);
    });
  }

  /* ============================================================
     EXPOSITION GLOBALE
  ============================================================ */
  window.SofretmaClient = {
    isLoggedIn, getToken, getUser, deconnecter,
    authHeaders, requireLogin,
    initInscription, initConnexion, initMonCompte, initPageFormulaire
  };

})();
