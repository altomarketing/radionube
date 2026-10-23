/**
 * RadioNube - Sistema Dinámico de Monedas (Client-Side)
 * Permite cambiar la moneda del sitio mediante:
 * 1. Variable en el navegador: `moneda = 'ARS'` o `window.currency = 'UYU'`
 * 2. Función JS: `setCurrency('MX')`
 * 3. Parámetro en URL: `?moneda=ARS` o `?cur=CL`
 * 4. Selector visual en el menú de navegación
 * 5. Persistencia automática en localStorage
 */

(function() {
  'use strict';

  // Configuración de divisas y tipos de cambio (Base: USD = 1)
  const CURRENCIES = {
    USD: { code: 'USD', symbol: 'u$s', symbolShort: '$', rate: 1,    locale: 'en-US', name: 'Dólar (USD)', flag: '🇺🇸' },
    UYU: { code: 'UYU', symbol: '$U',  symbolShort: '$U', rate: 40,   locale: 'es-UY', name: 'Pesos Uruguayos (UYU)', flag: '🇺🇾' },
    ARS: { code: 'ARS', symbol: '$',   symbolShort: '$',  rate: 1400, locale: 'es-AR', name: 'Pesos Argentinos (ARS)', flag: '🇦🇷' },
    MX:  { code: 'MX',  symbol: '$',   symbolShort: '$',  rate: 20,   locale: 'es-MX', name: 'Pesos Mexicanos (MX)', flag: '🇲🇽', alias: 'MXN' },
    MXN: { code: 'MXN', symbol: '$',   symbolShort: '$',  rate: 20,   locale: 'es-MX', name: 'Pesos Mexicanos (MXN)', flag: '🇲🇽', aliasOf: 'MX' },
    CO:  { code: 'CO',  symbol: '$',   symbolShort: '$',  rate: 3300, locale: 'es-CO', name: 'Pesos Colombianos (CO)', flag: '🇨🇴', alias: 'COP' },
    COP: { code: 'COP', symbol: '$',   symbolShort: '$',  rate: 3300, locale: 'es-CO', name: 'Pesos Colombianos (COP)', flag: '🇨🇴', aliasOf: 'CO' },
    CL:  { code: 'CL',  symbol: '$',   symbolShort: '$',  rate: 1000, locale: 'es-CL', name: 'Pesos Chilenos (CL)', flag: '🇨🇱', alias: 'CLP' },
    CLP: { code: 'CLP', symbol: '$',   symbolShort: '$',  rate: 1000, locale: 'es-CL', name: 'Pesos Chilenos (CLP)', flag: '🇨🇱', aliasOf: 'CL' },
    EUR: { code: 'EUR', symbol: '€',   symbolShort: '€',  rate: 0.9,  locale: 'es-ES', name: 'Euros (EUR)', flag: '🇪🇺' }
  };

  // Código canónico para selector
  function normalizeCode(input) {
    if (!input) return 'USD';
    const code = String(input).trim().toUpperCase();
    if (CURRENCIES[code]) {
      return CURRENCIES[code].aliasOf || code;
    }
    return 'USD';
  }

  // Estado interno de la moneda activa
  let _activeCurrency = 'USD';

  // Formateador de números
  function formatAmount(baseUsd, config) {
    const raw = baseUsd * config.rate;
    // Si la tasa genera números enteros o redondeo comercial limpio
    const isInteger = Math.round(raw * 100) % 100 === 0;
    const amount = isInteger ? Math.round(raw) : Math.round(raw * 100) / 100;

    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: isInteger ? 0 : 2
    }).format(amount);
  }

  // Actualizar los elementos en el DOM
  function updateDOM(currencyCode) {
    const config = CURRENCIES[currencyCode] || CURRENCIES['USD'];

    // 1. Símbolos de moneda principal (ej: u$s, $U, €, etc.)
    document.querySelectorAll('[data-currency-symbol]').forEach(el => {
      el.textContent = config.symbol;
    });

    // 2. Símbolo corto (ej: $, $U, €)
    document.querySelectorAll('[data-currency-symbol-short]').forEach(el => {
      el.textContent = config.symbolShort;
    });

    // 3. Código de moneda (ej: USD, ARS, etc.)
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
      const targetVal = config.code;
      if (sel.value !== targetVal) {
        sel.value = targetVal;
      }
    });

    // Disparar evento personalizado para extensiones o scripts secundarios
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
      // 1. Parámetro en la URL (?moneda=ARS o ?cur=ARS o ?currency=ARS)
      const params = new URLSearchParams(window.location.search);
      const urlCur = params.get('moneda') || params.get('cur') || params.get('currency');
      if (urlCur && CURRENCIES[urlCur.toUpperCase()]) {
        return normalizeCode(urlCur);
      }

      // 2. localStorage
      const saved = localStorage.getItem('radionube_currency') || localStorage.getItem('moneda');
      if (saved && CURRENCIES[saved.toUpperCase()]) {
        return normalizeCode(saved);
      }

      // 3. Variable global previa si fue definida antes de este script
      if (window.INITIAL_CURRENCY && CURRENCIES[String(window.INITIAL_CURRENCY).toUpperCase()]) {
        return normalizeCode(window.INITIAL_CURRENCY);
      }
    } catch (e) {}

    return 'USD';
  }

  // Inicializar
  const initial = detectInitialCurrency();
  _activeCurrency = initial;

  // Reactividad global: definir `moneda` y `currency` como variables en window
  try {
    Object.defineProperty(window, 'moneda', {
      get: function() { return _activeCurrency; },
      set: function(val) { setCurrency(val); },
      configurable: true
    });
    Object.defineProperty(window, 'currency', {
      get: function() { return _activeCurrency; },
      set: function(val) { setCurrency(val); },
      configurable: true
    });
  } catch (e) {
    window.moneda = _activeCurrency;
    window.currency = _activeCurrency;
  }

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }

})();
