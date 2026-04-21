/* ============================================================
   Script principal — SOFRETMA TRANSIT
   W2K-Digital | main.js
   Menu mobile, animations scroll, lazy load, utilitaires
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Menu hamburger mobile ---- */
  const hamburger = document.querySelector('.hamburger');
  const nav       = document.querySelector('.header__nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('actif');
      nav.classList.toggle('ouvert');
      document.body.style.overflow = nav.classList.contains('ouvert') ? 'hidden' : '';
    });

    // Fermeture sur clic lien
    nav.querySelectorAll('.nav__lien').forEach(lien => {
      lien.addEventListener('click', () => {
        hamburger.classList.remove('actif');
        nav.classList.remove('ouvert');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Dropdown mobile : clic pour ouvrir ---- */
  document.querySelectorAll('.nav__item--dropdown').forEach(item => {
    const lien = item.querySelector('.nav__lien');
    if (!lien) return;

    lien.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle('ouvert');
      }
    });
  });

  /* ---- Animation fade-in au scroll ---- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- Lien actif dans la navigation ---- */
  const pageCourante = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__lien').forEach(lien => {
    const href = lien.getAttribute('href');
    if (href === pageCourante) lien.classList.add('nav__lien--actif');
  });

  /* ---- Compteur animé pour les chiffres clés ---- */
  const compteurs = document.querySelectorAll('[data-compteur]');

  if (compteurs.length && 'IntersectionObserver' in window) {
    const obsCompteur = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animer(entry.target);
          obsCompteur.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    compteurs.forEach(el => obsCompteur.observe(el));
  }

  function animer(el) {
    const cible   = parseInt(el.dataset.compteur, 10);
    const duree   = 1800;
    const debut   = performance.now();
    const depart  = 0;

    requestAnimationFrame(function tick(maintenant) {
      const elapsed = maintenant - debut;
      const progress = Math.min(elapsed / duree, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(depart + (cible - depart) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    });
  }

  /* ---- Onglets (formulaires.html) ---- */
  const ongletsBtns     = document.querySelectorAll('.onglet__btn');
  const ongletsContenus = document.querySelectorAll('.onglet__contenu');

  ongletsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cible = btn.dataset.onglet;

      ongletsBtns.forEach(b => b.classList.remove('actif'));
      ongletsContenus.forEach(c => c.classList.remove('actif'));

      btn.classList.add('actif');
      const contenu = document.getElementById(cible);
      if (contenu) contenu.classList.add('actif');
    });
  });

  // Activer le premier onglet par défaut
  if (ongletsBtns.length) {
    ongletsBtns[0].click();
  }

  /* ---- Scroll fluide pour les ancres internes ---- */
  document.querySelectorAll('a[href^="#"]').forEach(ancre => {
    ancre.addEventListener('click', e => {
      const cible = document.querySelector(ancre.getAttribute('href'));
      if (cible) {
        e.preventDefault();
        cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
