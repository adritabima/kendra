(function(){
  const getStoredLanguage = () => localStorage.getItem('siteLanguage') || localStorage.getItem('adrita-language') || 'en';
  const setStoredLanguage = (lang) => {
    localStorage.setItem('siteLanguage', lang);
    localStorage.setItem('adrita-language', lang);
  };
  const defaultLang = getStoredLanguage();
  const selects = () => document.querySelectorAll('.site-language-select');
  const translations = window.TRANSLATIONS || {};

  function t(key, lang){
    if (!key) return null;
    return (translations[lang] && translations[lang][key]) || (translations['en'] && translations['en'][key]) || null;
  }

  function applyLang(lang){
    // text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const trans = t(key, lang);
      if (trans !== null) el.textContent = trans;
    });

    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const trans = t(key, lang);
      if (trans !== null) el.setAttribute('placeholder', trans);
    });

    // fallback: translate elements matched by their English text
    if (lang && lang !== 'en') {
      document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.dataset.i18nKey;
        const trans = t(key, lang);
        if (trans !== null) el.textContent = trans;
      });
      // attributes
      document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const payload = JSON.parse(el.dataset.i18nAttr);
        for (const attr in payload){
          const key = payload[attr];
          const trans = t(key, lang);
          if (trans !== null) el.setAttribute(attr, trans);
        }
      });
    }

    // update selects
    selects().forEach(s => s.value = lang);
    setStoredLanguage(lang);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // script.js owns full-page translation when it is loaded.
    if (window.__fullPageTranslator) return;

    // store default text for restoration
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!el.dataset.i18nDefault) el.dataset.i18nDefault = el.textContent.trim();
    });

    // Build reverse map from English text -> key for broad coverage
    const enMap = (translations && translations['en']) || {};
    const reverse = {};
    Object.keys(enMap).forEach(k => {
      const v = (enMap[k] || '').toString().trim();
      if (v) reverse[v] = k;
    });

    // Remember elements whose literal English text matches a translation key
    const tags = ['a','h1','h2','h3','h4','h5','h6','p','button','span','li','strong','small','label','option'];
    tags.forEach(tag => {
      document.querySelectorAll(tag).forEach(el => {
        if (el.childElementCount === 0){
          const txt = (el.textContent || '').trim();
          if (txt && reverse[txt]){
            if (!el.dataset.i18nDefault) el.dataset.i18nDefault = txt;
            el.dataset.i18nKey = reverse[txt];
            el.dataset.i18n = reverse[txt];
          }
        }
      });
    });

    // Attributes: placeholder, alt, title, value
    const attrNames = ['placeholder','alt','title','value'];
    document.querySelectorAll('*').forEach(el => {
      const payload = {};
      attrNames.forEach(attr => {
        const val = el.getAttribute && el.getAttribute(attr);
        if (val && reverse[val.trim()]){
          if (!el.dataset.i18nAttr) el.dataset.i18nAttr = JSON.stringify({});
          const obj = JSON.parse(el.dataset.i18nAttr || '{}');
          obj[attr] = reverse[val.trim()];
          el.dataset.i18nAttr = JSON.stringify(obj);
        }
      });
    });

    const lang = getStoredLanguage() || defaultLang;
    selects().forEach(s => s.value = lang);
    if (lang && lang !== 'en') applyLang(lang);

    selects().forEach(s => s.addEventListener('change', function(e){
      const newLang = e.target.value;
      if (newLang === 'en'){
        // restore defaults
        document.querySelectorAll('[data-i18n]').forEach(el => {
          el.textContent = el.dataset.i18nDefault || '';
        });
        setStoredLanguage('en');
        selects().forEach(x => x.value = 'en');
      } else {
        applyLang(newLang);
      }
    }));
  });

})();
