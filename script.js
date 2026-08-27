const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');
if(menu && nav){
  menu.addEventListener('click',()=>{
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const io = new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const form=document.querySelector('#contact-form');
if(form){form.addEventListener('submit',e=>{
  e.preventDefault();
  const f=new FormData(form);
  const subject=encodeURIComponent('Watnelm Service Request - '+(f.get('name')||'Website Inquiry'));
  const body=encodeURIComponent(`Name: ${f.get('name')||''}\nEmail: ${f.get('email')||''}\nPhone: ${f.get('phone')||''}\nProject type: ${f.get('project')||''}\n\nProject details:\n${f.get('message')||''}`);
  location.href=`mailto:service@watnelm.com?subject=${subject}&body=${body}`;
})}

const quoteForm = document.querySelector('#quote-form');

if (quoteForm) {
  const statusEl = document.querySelector('#form-status');
  const submitButton = quoteForm.querySelector('.quote-submit');
  const submitLabel = quoteForm.querySelector('.submit-label');

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    statusEl.className = 'form-status';
    statusEl.textContent = '';

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending request…';

    const payload = Object.fromEntries(new FormData(quoteForm).entries());

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'We could not send your request.');
      }

      quoteForm.reset();
      statusEl.className = 'form-status success';
      statusEl.innerHTML = '<strong>Request received.</strong> Thanks for contacting Watnelm. We’ll review the details and follow up using the contact information you provided.';
    } catch (error) {
      statusEl.className = 'form-status error';
      statusEl.innerHTML = '<strong>Something went wrong.</strong> Please try again, or email <a href="mailto:service@watnelm.com">service@watnelm.com</a>.';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitLabel.textContent = 'Submit Quote Request';
    }
  });
}
