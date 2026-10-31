/* DAIY Lab — lightweight scroll-reveal & assembly motion.
   Everything works without this file: CSS keeps content visible by default. */
(function () {
  'use strict';

  document.documentElement.classList.add('motion-init');

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showAllInstantly() {
    var els = document.querySelectorAll('[data-reveal]');
    for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
    var emblem = document.querySelector('.hero-emblem');
    if (emblem) emblem.classList.add('is-assembled');
  }

  if (!('IntersectionObserver' in window) || reduce) {
    showAllInstantly();
    return;
  }

  /* Stagger: siblings inside a [data-reveal-stagger] group get --d delays */
  var groups = document.querySelectorAll('[data-reveal-stagger]');
  for (var g = 0; g < groups.length; g++) {
    var items = groups[g].querySelectorAll('[data-reveal]');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--d', String(i));
    }
  }

  /* Reveal content as it enters the viewport; replayable when it leaves */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  var revealEls = document.querySelectorAll('[data-reveal]');
  for (var r = 0; r < revealEls.length; r++) {
    revealObserver.observe(revealEls[r]);
  }

  /* Hero assembly: parts align while the hero is in view, re-arm when it exits */
  var emblem = document.querySelector('.hero-emblem');
  var hero = document.querySelector('.hero');
  if (emblem && hero) {
    var assemblyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          emblem.classList.add('is-assembled');
        } else {
          emblem.classList.remove('is-assembled');
        }
      });
    }, { threshold: 0.25 });
    assemblyObserver.observe(hero);
  }
})();
