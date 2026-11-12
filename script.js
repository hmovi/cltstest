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
    window.location.href = `mailto:info@ctlservices.com?subject=${subject}&body=${body}`;
  });
}
