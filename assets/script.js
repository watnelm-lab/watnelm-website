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
