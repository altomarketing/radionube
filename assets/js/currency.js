/**
 * RadioNube - Sistema Dinámico de Monedas (Client-Side)
 * Permite cambiar la moneda del sitio mediante:
 * 1. Parámetro en URL: `?currency=ARS` (3 letras siempre)
 * 2. Variable en el navegador: `currency = 'ARS'` o `moneda = 'UYU'`
 * 3. Función JS: `setCurrency('MXN')`
 * 4. Selector visual en el menú de navegación
 * 5. Persistencia automática en localStorage
 * 6. Actualización automática de enlaces hacia panel.altomarketing.com con ?currency=XXX
 */

(function() {
  'use strict';

  // Configuración de divisas oficiales (Siempre 3 letras mayúsculas)
  const CURRENCIES = {
    USD: { code: 'USD', symbol: 'u$s', symbolShort: '$', rate: 1,    locale: 'en-US', name: 'Dólar (USD)', flag: '🇺🇸' },
    UYU: { code: 'UYU', symbol: '$ uyu', symbolShort: '$ uyu', rate: 40,   locale: 'es-UY', name: 'Pesos Uruguayos (UYU)', flag: '🇺🇾' },
    ARS: { code: 'ARS', symbol: '$',   symbolShort: '$',  rate: 1400, locale: 'es-AR', name: 'Pesos Argentinos (ARS)', flag: '🇦🇷' },
    MXN: { code: 'MXN', symbol: '$',   symbolShort: '$',  rate: 20,   locale: 'es-MX', name: 'Pesos Mexicanos (MXN)', flag: '🇲🇽' },
    COP: { code: 'COP', symbol: '$',   symbolShort: '$',  rate: 3300, locale: 'es-CO', name: 'Pesos Colombianos (COP)', flag: '🇨🇴' },
    CLP: { code: 'CLP', symbol: '$',   symbolShort: '$',  rate: 1000, locale: 'es-CL', name: 'Pesos Chilenos (CLP)', flag: '🇨🇱' },
    EUR: { code: 'EUR', symbol: '€',   symbolShort: '€',  rate: 0.9,  locale: 'es-ES', name: 'Euros (EUR)', flag: '🇪🇺' },
    // Alias de 2 letras mapeados directamente al estándar de 3 letras
    MX:  { aliasOf: 'MXN' },
    CO:  { aliasOf: 'COP' },
    CL:  { aliasOf: 'CLP' }
  };

  // Normalizar siempre a código de 3 letras
  function normalizeCode(input) {
    if (!input) return 'USD';
    const code = String(input).trim().toUpperCase();
    if (CURRENCIES[code]) {
      return CURRENCIES[code].aliasOf || code;
    }
    return 'USD';
  }

  // Estado interno de la moneda activa (3 letras)
  let _activeCurrency = 'USD';

  // Formateador de precios según locale de la moneda
  function formatAmount(baseUsd, config) {
    const raw = baseUsd * config.rate;
    const isInteger = Math.round(raw * 100) % 100 === 0;
    const amount = isInteger ? Math.round(raw) : Math.round(raw * 100) / 100;

    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: isInteger ? 0 : 2
    }).format(amount);
  }

  // Persistir moneda en localStorage y cookies
  function persistCurrency(code) {
    if (!code) return;
    try {
      localStorage.setItem('radionube_currency', code);
      localStorage.setItem('currency', code);
      localStorage.setItem('moneda', code);
    } catch (e) {}
    try {
      document.cookie = 'radionube_currency=' + code + ';path=/;max-age=31536000;SameSite=Lax';
      document.cookie = 'currency=' + code + ';path=/;max-age=31536000;SameSite=Lax';
      document.cookie = 'moneda=' + code + ';path=/;max-age=31536000;SameSite=Lax';
    } catch (e) {}
  }

  // Actualizar todos los enlaces que apuntan a panel.altomarketing.com
  function updatePanelLinks(currencyCode) {
    document.querySelectorAll('a[href*="panel.altomarketing.com"]').forEach(link => {
      try {
        const rawHref = link.getAttribute('data-base-href') || link.getAttribute('href');
        if (!link.hasAttribute('data-base-href')) {
          link.setAttribute('data-base-href', rawHref);
        }
        const url = new URL(rawHref, window.location.origin);
        url.searchParams.set('currency', currencyCode);
        link.setAttribute('href', url.toString());
      } catch (e) {
        // Fallback en caso de URLs atípicas
        let base = link.getAttribute('data-base-href') || link.href;
        if (!link.hasAttribute('data-base-href')) {
          link.setAttribute('data-base-href', base);
        }
        const cleanBase = base.replace(/([?&])currency=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
        const sep = cleanBase.includes('?') ? '&' : '?';
        link.href = cleanBase + sep + 'currency=' + currencyCode;
      }
    });
  }

  // Actualizar todos los enlaces internos del sitio para propagar ?currency=XXX entre páginas
  function updateInternalLinks(currencyCode) {
    document.querySelectorAll('a[href]').forEach(link => {
      const rawHref = link.getAttribute('data-base-href') || link.getAttribute('href');
      if (!rawHref) return;

      // Ignorar anclas locales, javascript, mailto, tel y links externos
      if (
        rawHref.startsWith('#') ||
        rawHref.startsWith('javascript:') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.includes('panel.altomarketing.com') ||
        rawHref.includes('wa.me') ||
        rawHref.includes('whatsapp') ||
        rawHref.includes('veni.link') ||
        rawHref.includes('apple.com') ||
        rawHref.includes('google.com') ||
        rawHref.includes('facebook.com') ||
        rawHref.includes('instagram.com') ||
        rawHref.includes('twitter.com') ||
        rawHref.includes('x.com') ||
        rawHref.includes('youtube.com') ||
        rawHref.includes('trustpilot.com') ||
        rawHref.includes('pages.dev')
      ) {
        return;
      }

      // Comprobar si es un enlace interno del sitio (relativo o con el mismo hostname / radionube)
      const isRelative = !rawHref.includes('://') && !rawHref.startsWith('//');
      const isInternalDomain = rawHref.includes('radionube.online') || rawHref.includes('radionube.com') || (link.hostname && link.hostname === window.location.hostname);

      if (isRelative || isInternalDomain) {
        try {
          if (!link.hasAttribute('data-base-href')) {
            link.setAttribute('data-base-href', rawHref);
          }
          const url = new URL(rawHref, window.location.href);
          url.searchParams.set('currency', currencyCode);

          if (isRelative && !rawHref.startsWith('/')) {
            const pathParts = url.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1] || '';
            const search = url.search || '';
            const hash = url.hash || '';
            link.setAttribute('href', fileName + search + hash);
          } else {
            link.setAttribute('href', url.pathname + url.search + url.hash);
          }
        } catch (e) {}
      }
    });
  }

  // Actualizar los elementos en el DOM
  function updateDOM(currencyCode) {
    const canonical = normalizeCode(currencyCode);
    const config = CURRENCIES[canonical] || CURRENCIES['USD'];

    // 1. Símbolos de moneda principal (ej: u$s, $U, €, etc.)
    document.querySelectorAll('[data-currency-symbol]').forEach(el => {
      el.textContent = config.symbol;
    });

    // 2. Símbolo corto (ej: $, $U, €)
    document.querySelectorAll('[data-currency-symbol-short]').forEach(el => {
      el.textContent = config.symbolShort;
    });

    // 3. Código de moneda de 3 letras (ej: USD, ARS, CLP, COP, MXN, UYU, EUR)
    document.querySelectorAll('[data-currency-code]').forEach(el => {
      el.textContent = config.code;
    });

    // 4. Precios con valor base data-price-usd
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const base = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(base)) {
        el.textContent = formatAmount(base, config);
      }
    });

    // 5. Selectores visuales
    document.querySelectorAll('.currency-selector').forEach(sel => {
      if (sel.value !== config.code) {
        sel.value = config.code;
      }
    });

    // 6. Enlaces hacia panel.altomarketing.com con ?currency=XXX
    updatePanelLinks(config.code);

    // 7. Enlaces internos del sitio para preservar ?currency=XXX en toda la navegación
    updateInternalLinks(config.code);

    // 8. Reflejar ?currency=XXX en la barra de direcciones del navegador
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('currency') !== config.code) {
        url.searchParams.set('currency', config.code);
        // Limpiar parámetros obsoletos si existían
        url.searchParams.delete('cur');
        url.searchParams.delete('moneda');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {}

    // 9. Persistir en localStorage y Cookies
    persistCurrency(config.code);

    // Disparar evento personalizado por si otros scripts lo escuchan
    try {
      window.dispatchEvent(new CustomEvent('currencychange', {
        detail: { currency: config.code, config }
      }));
    } catch (e) {}
  }

  // Función pública para fijar la moneda
  function setCurrency(code) {
    const canonical = normalizeCode(code);
    _activeCurrency = canonical;

    persistCurrency(canonical);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => updateDOM(canonical));
    } else {
      updateDOM(canonical);
    }

    return canonical;
  }

  function getCurrency() {
    return _activeCurrency;
  }

  // Determinar moneda inicial
  function detectInitialCurrency() {
    try {
      // 1. Prioridad: parámetro ?currency=XXX en la URL
      const params = new URLSearchParams(window.location.search);
      const urlCur = params.get('currency') || params.get('cur') || params.get('moneda');
      if (urlCur) {
        const code = normalizeCode(urlCur);
        persistCurrency(code);
        return code;
      }

      // 2. localStorage
      const saved = localStorage.getItem('radionube_currency') || localStorage.getItem('currency') || localStorage.getItem('moneda');
      if (saved) {
        const code = normalizeCode(saved);
        persistCurrency(code);
        return code;
      }

      // 3. Cookies
      const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:radionube_currency|currency|moneda)=([A-Za-z]{2,4})/);
      if (cookieMatch) {
        const code = normalizeCode(cookieMatch[1]);
        persistCurrency(code);
        return code;
      }

      // 4. Variable global previa si fue definida antes del script
      if (window.INITIAL_CURRENCY) {
        const code = normalizeCode(window.INITIAL_CURRENCY);
        persistCurrency(code);
        return code;
      }
    } catch (e) {}

    return 'USD';
  }

  // Inicializar
  const initial = detectInitialCurrency();
  _activeCurrency = initial;

  // Reactividad global: definir `currency` y `moneda` como variables en window
  try {
    Object.defineProperty(window, 'currency', {
      get: function() { return _activeCurrency; },
      set: function(val) { setCurrency(val); },
      configurable: true
    });
    Object.defineProperty(window, 'moneda', {
      get: function() { return _activeCurrency; },
      set: function(val) { setCurrency(val); },
      configurable: true
    });
  } catch (e) {
    window.currency = _activeCurrency;
    window.moneda = _activeCurrency;
  }

  // Función global para cambiar de idioma
  function switchLanguage(targetLang) {
    const rawPath = window.location.pathname || '/';
    const normalized = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
    const isCurrentEn = normalized === '/en' || normalized.startsWith('/en/');
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    let newPath = normalized;
    if (targetLang === 'en') {
      if (!isCurrentEn) {
        newPath = normalized === '/' ? '/en/' : '/en' + normalized;
      }
    } else if (targetLang === 'es') {
      if (isCurrentEn) {
        newPath = normalized.substring(3);
        if (!newPath || newPath === '') {
          newPath = '/';
        }
      }
    }

    if (newPath !== normalized) {
      window.location.href = newPath + search + hash;
    }
  }
  window.switchLanguage = switchLanguage;

  window.setCurrency = setCurrency;
  window.getCurrency = getCurrency;
  window.CURRENCY_CONFIG = CURRENCIES;

  // Event listeners en el DOM
  function initDOM() {
    updateDOM(_activeCurrency);

    // Conectar eventos en cualquier selector con clase .currency-selector
    document.querySelectorAll('.currency-selector').forEach(sel => {
      sel.value = _activeCurrency;
      sel.addEventListener('change', function() {
        setCurrency(this.value);
      });
    });

    // Conectar botones o links de cambio de idioma por banderas
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        switchLanguage(this.getAttribute('data-lang'));
      });
    });

    // Conectar selector de idioma si existe como <select class="lang-selector">
    const isEnPage = window.location.pathname.includes('/en/') || window.location.pathname.endsWith('/en');
    document.querySelectorAll('.lang-selector').forEach(sel => {
      sel.value = isEnPage ? 'en' : 'es';
      sel.addEventListener('change', function() {
        switchLanguage(this.value);
      });
    });

    // Interceptor al hacer click en cualquier botón de compra hacia panel.altomarketing.com o WhatsApp
    document.addEventListener('click', function(e) {
      const link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const isPanelCheckout = href.includes('panel.altomarketing.com') && (href.includes('/configurar/') || href.includes('/carrito'));
      const isWasapBuy = (href.includes('wasap') || href.includes('whatsapp') || href.includes('wa.me')) && /Quiero/i.test(href);

      // Si es un botón de compra o inicio de checkout
      if (isPanelCheckout || isWasapBuy) {
        // Disparar evento de conversión OpenAI Pixel (checkout_started)
        if (typeof window.oaiq === 'function') {
          try {
            window.oaiq('measure', 'checkout_started', { type: 'contents' });
          } catch (pixelErr) {
            console.error('Error al enviar evento OpenAI Pixel:', pixelErr);
          }
        }
      }

      // Si es enlace al panel, sincronizar parámetro de moneda activa
      if (link.matches('a[href*="panel.altomarketing.com"]')) {
        try {
          const rawHref = link.getAttribute('data-base-href') || link.getAttribute('href');
          const url = new URL(rawHref, window.location.origin);
          url.searchParams.set('currency', _activeCurrency);
          link.setAttribute('href', url.toString());
        } catch (err) {}
        return;
      }

      // Si es enlace interno del sitio, asegurar que preserve ?currency= en la navegación
      const rawHref = link.getAttribute('data-base-href') || link.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }
      const isRelative = !rawHref.includes('://') && !rawHref.startsWith('//');
      const isInternalDomain = rawHref.includes('radionube.online') || rawHref.includes('radionube.com') || (link.hostname && link.hostname === window.location.hostname);
      if (isRelative || isInternalDomain) {
        try {
          const url = new URL(link.href, window.location.href);
          url.searchParams.set('currency', _activeCurrency);
          link.href = url.toString();
        } catch (err) {}
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }

})();
