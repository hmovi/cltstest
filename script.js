// Header shadow on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const links = document.querySelector('.nav-links');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
}

// Company switcher (home page)
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(i));
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
  });
});
function select(index, focus) {
  tabs.forEach((t, i) => {
    t.setAttribute('aria-selected', i === index);
    t.tabIndex = i === index ? 0 : -1;
  });
  panels.forEach((p, i) => { p.hidden = i !== index; });
  if (focus) tabs[index].focus();
}
if (tabs.length) select(0);

// Contact form: opens the visitor's email app with the message filled in.
// To send through a service instead (Formspree, Vercel Functions, etc.), replace this handler.
const form = document.querySelector('#contact-form');
if (form) {
  const interest = new URLSearchParams(window.location.search).get('interest');
  if (interest === 'expert-network') form.elements.interest.value = interest;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent(`Enquiry: ${d.get('interest')} (${d.get('name')})`);
    const body = encodeURIComponent(`${d.get('message')}\n\n${d.get('name')}\n${d.get('organization') || ''}\n${d.get('email')}`);
    document.querySelector('.form-note').textContent = 'Opening your email app with your enquiry ready to send.';
    window.location.href = `mailto:team@ctlservices.ca?subject=${subject}&body=${body}`;
  });
}

// ---------- Home page motion ----------
(() => {
  const main = document.querySelector('.home-main');
  if (!main) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Typed line in the hero
  const typed = document.getElementById('typed');
  if (typed && !reduce) {
    const words = ['custom courses.', 'expert workshops.', 'your own LMS.', 'instructor training.', 'learning that sticks.'];
    let w = 0, c = words[0].length, del = true, first = true;
    (function tick() {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      let d = del ? 38 : 75;
      if (first) { first = false; setTimeout(tick, 2200); return; }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; d = 380; }
      else if (!del && c === words[w].length) { del = true; d = 1700; }
      else c += del ? -1 : 1;
      setTimeout(tick, d);
    })();
  }

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  const prog = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  prog();
  addEventListener('scroll', prog, { passive: true });

  // LMS loading demo
  const stage = document.querySelector('.lms-stage');
  if (stage) {
    const fill = stage.querySelector('.boot-fill');
    const pct = stage.querySelector('.boot-pct');
    const msg = stage.querySelector('.boot-msg');
    const toast = stage.querySelector('.lms-toast');
    const steps = [[0, 'Connecting to your database…'], [28, 'Loading courses and content…'], [58, 'Syncing learners and progress…'], [86, 'Preparing your portal…'], [100, 'Ready']];
    const counters = stage.querySelectorAll('[data-count]');
    let token = 0;

    const setCounts = (my, animate) => counters.forEach((el) => {
      const to = +el.dataset.count, suf = el.dataset.suf || '';
      const show = (v) => { el.textContent = Math.round(v).toLocaleString('en-CA') + suf; };
      if (!animate) return show(to);
      show(0);
      const t0 = performance.now();
      (function f(now) {
        const t = Math.min(1, (now - t0) / 1400);
        show(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1 && my === token) requestAnimationFrame(f);
      })(t0);
    });

    const finalState = () => {
      stage.classList.add('app', 'loaded');
      fill.style.width = '100%'; pct.textContent = '100%'; msg.textContent = 'Ready';
      setCounts(token, false);
    };

    async function run() {
      const my = ++token;
      stage.classList.remove('app', 'loaded', 'toast-on');
      fill.style.width = '0%'; pct.textContent = '0%'; msg.textContent = steps[0][1];
      setCounts(my, false);
      const dur = 3600, t0 = performance.now();
      await new Promise((res) => {
        (function f(now) {
          if (my !== token) return res();
          const t = Math.min(1, (now - t0) / dur);
          const p = Math.round(100 * (0.5 - 0.5 * Math.cos(Math.PI * t)));
          fill.style.width = p + '%'; pct.textContent = p + '%';
          msg.textContent = [...steps].reverse().find((s) => p >= s[0])[1];
          t < 1 ? requestAnimationFrame(f) : res();
        })(t0);
      });
      if (my !== token) return;
      await wait(450); if (my !== token) return;
      stage.classList.add('app');
      await wait(1300); if (my !== token) return;
      stage.classList.add('loaded');
      setCounts(my, true);
      await wait(1900); if (my !== token) return;
      stage.classList.add('toast-on');
      await wait(4500); if (my !== token) return;
      stage.classList.remove('toast-on');
    }

    const replay = document.getElementById('lms-replay');
    if (reduce) {
      finalState();
    } else {
      if (replay) replay.addEventListener('click', run);
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) { io.disconnect(); run(); }
      }, { threshold: 0.4 });
      io.observe(stage);
    }
  }

  // Word-by-word headings + scroll reveals
  if (reduce || !('IntersectionObserver' in window)) return;
  try {
    const splitWords = (h) => {
      const text = h.textContent.trim();
      h.setAttribute('aria-label', text);
      h.innerHTML = text.split(/\s+/).map((word, i) =>
        `<span class="w" aria-hidden="true"><span style="--i:${i}">${word}</span></span>`).join(' ');
      h.classList.add('sw');
    };
    const heads = main.querySelectorAll('.home-section > h2, .global-copy h2, .cta h2, .lms-copy h2');
    heads.forEach(splitWords);

    const sel = '.tile, .step, .pills span, .tab, .switch > div:last-child, .global-image, .global-copy > *:not(h2), .cta p, .cta .actions, .home-section > .lede, .home-section > .actions, .lms-copy > *:not(h2), .lms-fig';
    const idx = new Map();
    const items = [...main.querySelectorAll(sel)];
    items.forEach((el) => {
      const key = el.parentElement;
      const n = idx.get(key) || 0;
      idx.set(key, n + 1);
      el.style.setProperty('--d', Math.min(n, 8));
      el.classList.add('rv');
    });

    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    [...heads, ...items].forEach((el) => io2.observe(el));
    document.documentElement.classList.add('js');
  } catch (err) { /* content stays visible if anything fails */ }
})();
