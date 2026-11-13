(function () {
  'use strict';
  // ---- Form integration point ------------------------------------------
  // Paste your form service URL here (Formspree, Web3Forms, Google Apps Script, own API).
  // It must accept a POST with JSON and return a 2xx status on success.
  // While empty, the form does NOT submit data; it offers an email fallback instead.
  var FORM_ENDPOINT = '';
  var FALLBACK_EMAIL = 'hello@theindustrypractice.com'; // placeholder

  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Preselect service from "Learn more" buttons
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { document.getElementById('service').value = a.dataset.service; });
  });

  document.getElementById('yr').textContent = new Date().getFullYear();

  var form = document.getElementById('enquiry'), status = document.getElementById('status');
  function say(html, bad) { status.innerHTML = html; status.style.color = bad ? '#D63B3B' : '#0B7A4B'; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    form.querySelectorAll('[required]').forEach(function (el) {
      var ok = el.value.trim() && (el.type !== 'email' || /^\S+@\S+\.\S+$/.test(el.value));
      el.setAttribute('aria-invalid', !ok);
      if (!ok) bad.push(el);
    });
    if (bad.length) { say('Please complete the highlighted fields.', true); bad[0].focus(); return; }
    var data = Object.fromEntries(new FormData(form).entries());
    if (data.website_hp) return; // honeypot

    if (!FORM_ENDPOINT) {
      var body = Object.keys(data).filter(function (k) { return k !== 'website_hp'; })
        .map(function (k) { return k + ': ' + data[k]; }).join('\n');
      var href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent('Enquiry: ' + data.service) + '&body=' + encodeURIComponent(body);
      say('This form is not connected to a service yet, so nothing has been sent. <a href="' + href + '">Send this enquiry by email instead</a>.', true);
      return;
    }
    say('Sending…');
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); say('Thank you. We have received your enquiry and will reply soon.'); })
      .catch(function () { say('Could not send your enquiry. Please try again or email ' + FALLBACK_EMAIL + '.', true); });
  });
})();
