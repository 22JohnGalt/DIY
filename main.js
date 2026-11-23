'use strict';

const hero = document.querySelector('.hero');
const heroStage = hero.querySelector('.hero-stage');
const heroTitle = hero.querySelector('h1');
const sectionIndex = document.querySelector('.section-index');
const indexedSections = Array.from(sectionIndex.querySelectorAll('a'), link => ({
  link,
  section: document.getElementById(link.hash.slice(1))
}));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroMotion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 31rem)');
let framePending = false;
let activeSection = indexedSections[0];
let heroProgress = 1;

function easeBetween(progress, start, end) {
  const position = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return position * position * (3 - 2 * position);
}

function updateHero() {
  let progress = 1;

  if (heroMotion.matches) {
    const bounds = hero.getBoundingClientRect();
    const pinTop = Number.parseFloat(getComputedStyle(heroStage).top);
    const travel = Math.max(1, bounds.height - heroStage.offsetHeight);
    progress = Math.min(1, Math.max(0, (pinTop - bounds.top) / travel));
  }

  if (progress === heroProgress) return;
  heroProgress = progress;

  // The print starts rolling first. The mark and headline share the same type movement.
  const ink = easeBetween(progress, .08, .79);
  const type = easeBetween(progress, .31, .67);
  hero.style.setProperty('--ink-progress', ink);
  hero.style.setProperty('--type-progress', type);

  const title = type < .5 ? 'do it yourself' : 'do AI yourself';
  if (heroTitle.getAttribute('aria-label') !== title) heroTitle.setAttribute('aria-label', title);
}

function updateScrollState() {
  framePending = false;

  const viewportHeight = document.documentElement.clientHeight;
  const scrollEnd = window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 2;
  const readingLine = Math.max(62, Math.min(viewportHeight * 0.25, 180));
  let current = indexedSections[0];

  // Short sections near the footer can reach the bottom before they reach the reading line.
  if (scrollEnd) {
    current = indexedSections.at(-1);
  } else {
    for (const entry of indexedSections) {
      if (entry.section.getBoundingClientRect().top > readingLine) break;
      current = entry;
    }
  }

  updateHero();

  if (current !== activeSection) {
    activeSection.link.removeAttribute('aria-current');
    current.link.setAttribute('aria-current', 'location');
    activeSection = current;
  }
}

function scheduleScrollUpdate() {
  if (framePending) return;
  framePending = true;
  window.requestAnimationFrame(updateScrollState);
}

function updateHeroMotion() {
  hero.classList.toggle('has-scroll-story', heroMotion.matches);
  updateScrollState();
}

updateHeroMotion();
window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('pageshow', scheduleScrollUpdate);
window.addEventListener('hashchange', scheduleScrollUpdate);
heroMotion.addEventListener('change', updateHeroMotion);

for (const walkthrough of document.querySelectorAll('[data-walkthrough]')) {
  const controls = walkthrough.querySelector('[data-controls]');
  const buttons = controls.querySelectorAll('button[data-step]');
  const panels = walkthrough.querySelectorAll('[data-panel]');
  const highlights = walkthrough.querySelectorAll('[data-highlight]');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const step = button.dataset.step;
      walkthrough.dataset.state = step;

      for (const panel of panels) {
        panel.hidden = panel.dataset.panel !== step;
      }
      for (const option of buttons) {
        if (option.hasAttribute('aria-pressed')) {
          option.setAttribute('aria-pressed', String(option === button));
        }
      }
      for (const highlight of highlights) {
        highlight.classList.toggle('is-highlighted', highlight.dataset.highlight === step);
      }

      if (walkthrough.hasAttribute('data-motion') && !reducedMotion.matches) {
        walkthrough.classList.remove('is-playing');
        // Restart the illustration even when its selected step is pressed again.
        void walkthrough.offsetWidth;
        walkthrough.classList.add('is-playing');
      }
    });
  }

  controls.hidden = false;
  const fallback = walkthrough.querySelector('[data-fallback]');
  if (fallback) fallback.hidden = true;
}

for (const button of document.querySelectorAll('[data-project-disclosure]')) {
  const note = document.getElementById(button.getAttribute('aria-controls'));

  button.addEventListener('click', () => {
    note.hidden = !note.hidden;
    button.setAttribute('aria-expanded', String(!note.hidden));
  });

  note.hidden = true;
  note.querySelector('h3').hidden = true;
  button.hidden = false;
}

const memoryTool = document.querySelector('#memory-tool');
const modelSizes = memoryTool.querySelectorAll('input[name="insize"]');
const ramRange = memoryTool.querySelector('#ramRange');
const ramOut = memoryTool.querySelector('#ramOut');
const verdict = memoryTool.querySelector('#inVerdict');
const memoryMeter = memoryTool.querySelector('#inFill');

function updateMemoryEstimate() {
  const size = Number(memoryTool.querySelector('input[name="insize"]:checked').value);
  const ram = ramRange.valueAsNumber;
  const footprint = size * 0.55 + 0.4;
  const ratio = footprint / ram;
  let fit;

  if (ratio <= 0.6) {
    fit = 'Comfortable in ' + ram + ' GB.';
  } else if (ratio <= 1) {
    fit = 'Tight in ' + ram + ' GB. Keep the context short.';
  } else {
    fit = 'Won’t fit in ' + ram + ' GB. Try a smaller model or more memory.';
  }

  verdict.textContent = 'About ' + footprint.toFixed(1) + ' GB at 4-bit. ' + fit;
  ramOut.textContent = ram + ' GB';
  memoryMeter.value = Math.min(ratio, 1);
}

for (const option of modelSizes) option.addEventListener('change', updateMemoryEstimate);
ramRange.addEventListener('input', updateMemoryEstimate);
window.addEventListener('pageshow', updateMemoryEstimate);
updateMemoryEstimate();
memoryTool.hidden = false;
document.querySelector('#memory-fallback').hidden = true;
