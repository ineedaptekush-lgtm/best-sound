'use strict';
const cases = JSON.parse(document.getElementById('case-data').textContent);
const caseDialog = document.getElementById('case-dialog');
const menuDialog = document.getElementById('menu-dialog');
const menuToggle = document.querySelector('.menu-toggle');
const form = document.getElementById('lead-form');
const serviceSelect = document.getElementById('service');
let activeCase = null;
let imageIndex = 0;

function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}
function closeDialog(dialog) {
  dialog.close();
}
[caseDialog, menuDialog].forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (!caseDialog.open && !menuDialog.open) document.body.classList.remove('modal-open');
    if (dialog === menuDialog) menuToggle.setAttribute('aria-expanded', 'false');
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  });
});
document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close)));
});
menuToggle.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'true');
  openDialog(menuDialog);
});
menuDialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(menuDialog)));

document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.service;
  });
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    let visible = 0;
    document.querySelectorAll('.work-card').forEach(card => {
      const categories = card.dataset.category.split('|');
      card.hidden = value !== 'all' && !categories.includes(value);
      if (!card.hidden) visible++;
    });
    document.getElementById('filter-status').textContent = 'Показано работ: ' + visible;
  });
});

function showCaseImage(index) {
  if (!activeCase) return;
  imageIndex = (index + activeCase.images.length) % activeCase.images.length;
  const item = activeCase.images[imageIndex];
  const image = document.getElementById('case-image');
  image.src = item.src;
  image.alt = item.alt;
  image.width = item.width;
  image.height = item.height;
  document.getElementById('case-counter').textContent = (imageIndex + 1) + ' / ' + activeCase.images.length;
  document.querySelectorAll('#case-thumbs button').forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === imageIndex));
  });
  document.querySelectorAll('.gallery-arrow').forEach(button => { button.hidden = activeCase.images.length < 2; });
}
function showCase(id) {
  activeCase = cases.find(item => item.id === id);
  if (!activeCase) return;
  document.getElementById('case-title').textContent = activeCase.title;
  document.getElementById('case-category').textContent = activeCase.category + ' / Best Sound';
  const list = document.getElementById('case-tasks');
  list.replaceChildren(...activeCase.tasks.map(text => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
  const thumbs = document.getElementById('case-thumbs');
  thumbs.replaceChildren(...activeCase.images.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Фотография ' + (index + 1));
    button.setAttribute('aria-pressed', 'false');
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    img.width = 64;
    img.height = 64;
    img.loading = 'lazy';
    button.append(img);
    button.addEventListener('click', () => showCaseImage(index));
    return button;
  }));
  showCaseImage(0);
  openDialog(caseDialog);
}
document.querySelectorAll('[data-case]').forEach(button => {
  button.addEventListener('click', () => showCase(button.dataset.case));
});
document.querySelector('.gallery-arrow.prev').addEventListener('click', () => showCaseImage(imageIndex - 1));
document.querySelector('.gallery-arrow.next').addEventListener('click', () => showCaseImage(imageIndex + 1));
caseDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showCaseImage(imageIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
document.getElementById('case-action').addEventListener('click', () => {
  serviceSelect.value = activeCase.category === 'Подсветка' ? 'Контурная подсветка' : activeCase.category;
  document.getElementById('message').value = 'Хочу обсудить похожую работу: ' + activeCase.title + '. ' + activeCase.tasks.join('; ') + '.';
  closeDialog(caseDialog);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const carInput = document.getElementById('car');
  const car = carInput.value.trim();
  carInput.setCustomValidity(car.length < 2 ? 'Укажите марку и модель автомобиля.' : '');
  if (!form.reportValidity()) return;
  const details = document.getElementById('message').value.trim();
  const lines = ['Здравствуйте, Best Sound!', 'Хочу обсудить работы для автомобиля: ' + car + '.', 'Задача: ' + serviceSelect.value + '.'];
  if (details) lines.push('Детали: ' + details);
  const url = 'https://wa.me/79805390797?text=' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.append(link);
  link.click();
  link.remove();
  document.getElementById('form-status').textContent = 'Сообщение подготовлено. Отправьте его в открывшемся чате WhatsApp.';
});
document.getElementById('car').addEventListener('input', event => event.target.setCustomValidity(''));
form.addEventListener('input', () => { document.getElementById('form-status').textContent = ''; });

const backtop = document.querySelector('.backtop');
window.addEventListener('scroll', () => { backtop.hidden = window.scrollY < 800; }, { passive: true });
backtop.addEventListener('click', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'});
  document.querySelector('.brand').focus({preventScroll: true});
});
document.getElementById('year').textContent = new Date().getFullYear();
