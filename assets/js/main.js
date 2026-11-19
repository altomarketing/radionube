/**
 * Top Promo Banner (Black Friday / Special Announcements)
 * Self-contained module with localStorage persistence
 */
(function() {
  "use strict";

  function initPromoBanner() {
    if (document.getElementById('top-promo-banner')) return;

    const STORAGE_KEY = 'radionube_top_promo_closed';
    const params = new URLSearchParams(window.location.search);
    const forceShow = params.get('promo') === '1' || params.get('top_promo') === '1';
    const forceReset = params.get('reset_promo') === '1';

    if (forceReset) {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    }

    if (!forceShow) {
      try {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
          return;
        }
      } catch(e) {}
    }

    const isEn = window.location.pathname.includes('/en/') || document.documentElement.lang === 'en';

    const badgeText = 'Black Friday Promo';
    const promoText = isEn
      ? 'Up to November 20th <strong>30% OFF</strong> on your first purchase !'
      : 'Hasta 20 de noviembre <strong>30% OFF</strong> en tu primer compra !';
    const ctaText = isEn ? 'Claim on WhatsApp' : 'Reclamar por WhatsApp';
    const closeTitle = isEn ? 'Close promo' : 'Cerrar promo';
    const waLink = 'https://api.whatsapp.com/send?phone=5491171378487&text=Promo-Black-Friday';

    const banner = document.createElement('div');
    banner.id = 'top-promo-banner';
    banner.innerHTML = `
      <div class="top-promo-content">
        <span class="top-promo-badge"><i class="bi bi-fire"></i> ${badgeText}</span>
        <span class="top-promo-text">${promoText}</span>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="top-promo-btn">
          <i class="bi bi-whatsapp"></i> ${ctaText}
        </a>
      </div>
      <button type="button" class="top-promo-close" aria-label="${closeTitle}" title="${closeTitle}">
        &times;
      </button>
    `;

    document.body.prepend(banner);
    document.body.classList.add('has-top-promo-banner');

    function updateBannerHeight() {
      const h = banner.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--top-promo-height', h + 'px');
      }
    }
    updateBannerHeight();
    window.addEventListener('resize', updateBannerHeight);

    const closeBtn = banner.querySelector('.top-promo-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        banner.classList.add('promo-hidden');
        document.body.classList.remove('has-top-promo-banner');
        document.documentElement.style.removeProperty('--top-promo-height');
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch(e) {}
        setTimeout(function() { banner.remove(); }, 350);
      });
    }
  }

  window.resetPromoBanner = function() {
    try { localStorage.removeItem('radionube_top_promo_closed'); } catch(e) {}
    location.reload();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPromoBanner);
  } else {
    initPromoBanner();
  }
})();

/**
* Template Name: Sailor
* Template URL: https://bootstrapmade.com/sailor-free-bootstrap-theme/
* Updated: Mar 17 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Hero carousel indicators
   */
  let heroCarouselIndicators = select("#hero-carousel-indicators")
  let heroCarouselItems = select('#heroCarousel .carousel-item', true)

  if (heroCarouselIndicators && heroCarouselItems && heroCarouselItems.length > 0) {
    heroCarouselItems.forEach((item, index) => {
      (index === 0) ?
      heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "' class='active'></li>":
        heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "'></li>"
    });
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  if (select('.portfolio-details-slider')) {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  }

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox({
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  });

  /**
   * Facebook reviews slider
   */
  if (select('.facebook-slider')) {
    new Swiper('.facebook-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      slidesPerView: 1,
      spaceBetween: 24,
      navigation: {
        nextEl: '.facebook-arrow-next',
        prevEl: '.facebook-arrow-prev'
      },
      pagination: {
        el: '.facebook-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 28
        }
      }
    });
  }

  /**
   * Trustpilot reviews slider
   */
  if (select('.trustpilot-slider')) {
    new Swiper('.trustpilot-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      slidesPerView: 1,
      spaceBetween: 24,
      navigation: {
        nextEl: '.trustpilot-arrow-next',
        prevEl: '.trustpilot-arrow-prev'
      },
      pagination: {
        el: '.trustpilot-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 24
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 28
        }
      }
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

})()