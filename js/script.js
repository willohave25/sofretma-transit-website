/* ============================================================
   SOFRETMA TRANSIT — Script principal
   W2K-Digital | script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Menu hamburger mobile ---- */
  var hamburger = document.getElementById('hamburger');
  var navMenu   = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      var ouvert = navMenu.classList.toggle('ouvert');
      hamburger.classList.toggle('actif', ouvert);
      hamburger.setAttribute('aria-expanded', ouvert);
    });

    // Fermer menu au clic sur un lien
    navMenu.querySelectorAll('.nav__lien, .dropdown__lien').forEach(function (lien) {
      lien.addEventListener('click', function () {
        navMenu.classList.remove('ouvert');
        hamburger.classList.remove('actif');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Dropdown Services (bouton) ---- */
  document.querySelectorAll('.nav__item--dropdown').forEach(function (item) {
    var btn = item.querySelector('.nav__dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var ouvert = item.classList.toggle('ouvert');
      btn.setAttribute('aria-expanded', ouvert);
    });

    // Fermer en cliquant ailleurs
    document.addEventListener('click', function () {
      item.classList.remove('ouvert');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Header : ombre au scroll ---- */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 4px 32px rgba(0,0,0,0.5)';
      } else {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
      }
    }, { passive: true });
  }

  /* ---- Animations au scroll (fade-in) ---- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });

  /* ---- Compteurs chiffres clés ---- */
  var compteurs = document.querySelectorAll('.chiffre__nombre[data-compteur]');
  if (compteurs.length > 0) {
    var compteurObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el      = entry.target;
          var cible   = parseInt(el.getAttribute('data-compteur'), 10);
          var duree   = 1800;
          var debut   = null;

          function animer(ts) {
            if (!debut) debut = ts;
            var progression = Math.min((ts - debut) / duree, 1);
            var valeur = Math.floor(progression * cible);
            el.textContent = valeur + (progression === 1 ? '+' : '');
            if (progression < 1) requestAnimationFrame(animer);
          }

          requestAnimationFrame(animer);
          compteurObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    compteurs.forEach(function (el) {
      compteurObserver.observe(el);
    });
  }

  /* ---- Slideshow hero (fond défilant automatique) ---- */
  var heroSlides = document.querySelectorAll('.hero__slide');
  if (heroSlides.length > 1) {
    var slideActif = 0;
    setInterval(function () {
      heroSlides[slideActif].classList.remove('active');
      slideActif = (slideActif + 1) % heroSlides.length;
      heroSlides[slideActif].classList.add('active');
    }, 5000); // changement toutes les 5 secondes
  }

  /* ---- Scroll doux liens ancres ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
    lien.addEventListener('click', function (e) {
      var cible = document.querySelector(this.getAttribute('href'));
      if (cible) {
        e.preventDefault();
        var offsetHeader = header ? header.offsetHeight + 16 : 96;
        window.scrollTo({
          top: cible.getBoundingClientRect().top + window.scrollY - offsetHeader,
          behavior: 'smooth'
        });
      }
    });
  });

});
