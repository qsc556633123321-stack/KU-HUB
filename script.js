const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '開啟導覽選單');
    siteNav.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? '開啟導覽選單' : '關閉導覽選單');
    siteNav.classList.toggle('is-open', !isExpanded);
  });

  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reduced-motion');
}

const revealSelector = '.hero-copy, .hero-art, .stats-section .stat-item, .section-heading, .featured-section, .project-controls, .filter-bar, .project-card, .about-index, .about-copy, .detail-back, .project-detail';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const observeReveals = (root) => {
    if (root instanceof Element && root.matches(revealSelector)) {
      root.classList.add('js-reveal');
      revealObserver.observe(root);
    }

    root.querySelectorAll?.(revealSelector).forEach((element) => {
      element.classList.add('js-reveal');
      revealObserver.observe(element);
    });
  };

  observeReveals(document);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(observeReveals);
    });
  }).observe(document.body, { childList: true, subtree: true });
}