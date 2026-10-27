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

    // 7. Reflejar ?currency=XXX en la barra de direcciones del navegador
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

    try {
      localStorage.setItem('radionube_currency', canonical);
      localStorage.setItem('currency', canonical);
      localStorage.setItem('moneda', canonical);
    } catch (e) {}

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
        return normalizeCode(urlCur);
      }

      // 2. localStorage
      const saved = localStorage.getItem('radionube_currency') || localStorage.getItem('currency') || localStorage.getItem('moneda');
      if (saved) {
        return normalizeCode(saved);
      }

      // 3. Variable global previa si fue definida antes del script
      if (window.INITIAL_CURRENCY) {
        return normalizeCode(window.INITIAL_CURRENCY);
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

    // Interceptor de seguridad al hacer click en cualquier link hacia panel.altomarketing.com
    document.addEventListener('click', function(e) {
      const link = e.target && e.target.closest ? e.target.closest('a[href*="panel.altomarketing.com"]') : null;
      if (link) {
        try {
          const rawHref = link.getAttribute('data-base-href') || link.getAttribute('href');
          const url = new URL(rawHref, window.location.origin);
          url.searchParams.set('currency', _activeCurrency);
          link.setAttribute('href', url.toString());
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
