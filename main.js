/* DAIY Lab — scroll reveals + interactive instruments.
   Progressive enhancement only: all content is visible without this file. */
(function () {
  'use strict';

  document.documentElement.classList.add('motion-init');

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function forEach(sel, fn) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) fn(els[i], i);
  }

  /* ---------- stagger: siblings in a [data-reveal-stagger] group get --d ---------- */
  var groups = document.querySelectorAll('[data-reveal-stagger]');
  for (var g = 0; g < groups.length; g++) {
    var items = groups[g].querySelectorAll('[data-reveal]');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--d', String(i));
    }
  }

  /* ---------- intro morph: DIY -> DAIY, one scroll variable drives the CSS ---------- */
  var morph = document.getElementById('intro');
  if (morph) {
    if (reduce) {
      morph.style.setProperty('--p', '1');
    } else {
      var morphTicking = false;
      var morphUpdate = function () {
        morphTicking = false;
        var total = morph.offsetHeight - window.innerHeight;
        var y = -morph.getBoundingClientRect().top;
        var p = total > 0 ? Math.min(Math.max(y / total, 0), 1) : 1;
        morph.style.setProperty('--p', p.toFixed(4));
      };
      var morphReq = function () {
        if (!morphTicking) { morphTicking = true; window.requestAnimationFrame(morphUpdate); }
      };
      window.addEventListener('scroll', morphReq, { passive: true });
      window.addEventListener('resize', morphReq);
      morphUpdate();
    }
  }

  /* ---------- scroll reveals: visible on enter, re-armed on full exit ---------- */
  if (hasIO && !reduce) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
          entry.target.classList.add('is-visible');
        } else if (!entry.isIntersecting) {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: [0, 0.12] });
    forEach('[data-reveal]', function (el) { revealObserver.observe(el); });

    /* in-view flags for structure: section rules + diagram assembly */
    var inviewObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: [0, 0.15] });
    forEach('[data-inview]', function (el) { inviewObserver.observe(el); });
  }

  /* ---------- nav: current-section highlight ---------- */
  if (hasIO) {
    var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    var byId = {};
    for (var n = 0; n < navLinks.length; n++) {
      var href = navLinks[n].getAttribute('href').slice(1);
      var target = document.getElementById(href);
      if (target && href !== 'top') byId[href] = navLinks[n];
    }
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          for (var k in byId) byId[k].removeAttribute('aria-current');
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      navObserver.observe(document.getElementById(id));
    });
  }

  /* ---------- hero size picker ---------- */
  var hsRead = document.getElementById('hsRead');
  var hsItems = document.querySelectorAll('.hs-item');
  for (var h = 0; h < hsItems.length; h++) {
    hsItems[h].addEventListener('click', function (e) {
      var btn = e.currentTarget;
      for (var j = 0; j < hsItems.length; j++) {
        hsItems[j].classList.remove('is-active');
        hsItems[j].setAttribute('aria-pressed', 'false');
      }
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      if (hsRead) {
        hsRead.textContent = btn.dataset.size + ' — roughly ' + btn.dataset.gb +
          ' GB at 4-bit, ' + btn.dataset.flavor + '.';
      }
    });
  }

  /* ---------- diagram legend: focus a node, swap the note ---------- */
  var dnote = document.getElementById('dnote');
  var dls = document.querySelectorAll('.dlegend .dl');
  for (var d = 0; d < dls.length; d++) {
    dls[d].addEventListener('click', function (e) {
      var btn = e.currentTarget;
      for (var j = 0; j < dls.length; j++) {
        dls[j].classList.remove('is-active');
        dls[j].removeAttribute('aria-pressed');
      }
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      var node = document.getElementById('dg-' + btn.dataset.node);
      for (var k = 0; k < dls.length; k++) {
        var g = document.getElementById('dg-' + dls[k].dataset.node);
        if (g) g.classList.remove('is-active');
      }
      if (node) node.classList.add('is-active');
      if (dnote) dnote.textContent = btn.dataset.note;
    });
  }

  /* ---------- instrument: will it fit ---------- */
  var ramRange = document.getElementById('ramRange');
  var inVerdict = document.getElementById('inVerdict');
  var inFill = document.getElementById('inFill');
  var ramOut = document.getElementById('ramOut');
  var GB_PER_BN = 0.55;
  var OVERHEAD = 0.4;

  function updateInstrument() {
    if (!ramRange || !inVerdict || !inFill || !ramOut) return;
    var sizeEl = document.querySelector('input[name="insize"]:checked');
    if (!sizeEl) return;
    var size = parseFloat(sizeEl.value);
    var ram = parseInt(ramRange.value, 10);
    var fp = size * GB_PER_BN + OVERHEAD;
    var ratio = fp / ram;
    var phrase;
    if (ratio <= 0.6) {
      phrase = 'comfortable in ' + ram + ' GB.';
    } else if (ratio <= 1) {
      phrase = 'tight in ' + ram + ' GB. Keep the context short.';
    } else {
      phrase = "won't fit in " + ram + ' GB. Try a smaller model or more memory.';
    }
    inVerdict.textContent = 'About ' + fp.toFixed(1) + ' GB at 4-bit — ' + phrase;
    inFill.style.width = Math.min(ratio, 1) * 100 + '%';
    ramOut.textContent = ram + ' GB available';
  }
  if (ramRange) {
    ramRange.addEventListener('input', updateInstrument);
    document.querySelectorAll('input[name="insize"]').forEach(function (r) {
      r.addEventListener('change', updateInstrument);
    });
  }

  /* ---------- copy address ---------- */
  var copyBtn = document.getElementById('copyMail');
  if (copyBtn && navigator.clipboard && navigator.clipboard.writeText) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(function () {
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('ok');
        window.setTimeout(function () {
          copyBtn.textContent = 'Copy address';
          copyBtn.classList.remove('ok');
        }, 1600);
      }).catch(function () {});
    });
  }
})();
