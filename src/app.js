let allTravelsData = [];

export default function createSearchForm() {
  const container = document.querySelector('.search-form-container');
  if (!container) return;

  const form = document.createElement('form');
  form.className = 'search-form';

  const showAllBtn = document.createElement('button');
  showAllBtn.type = 'submit';
  showAllBtn.className = 'show-all-button';
  showAllBtn.textContent = 'Показать всё';

  const labelMin = document.createElement('label');
  labelMin.htmlFor = 'price_min';
  labelMin.textContent = 'Цена от:';

  const inputMin = document.createElement('input');
  inputMin.type = 'number';
  inputMin.name = 'price_min';
  inputMin.id = 'price_min';
  inputMin.className = 'price-input';
  inputMin.placeholder = 'Например, 10 000';
  inputMin.min = '0';

  const labelMax = document.createElement('label');
  labelMax.htmlFor = 'price_max';
  labelMax.textContent = 'Цена до:';

  const inputMax = document.createElement('input');
  inputMax.type = 'number';
  inputMax.name = 'price_max';
  inputMax.id = 'price_max';
  inputMax.className = 'price-input';
  inputMax.placeholder = 'Например, 100 000';
  inputMax.min = '0';

  const filterBtn = document.createElement('button');
  filterBtn.type = 'button';
  filterBtn.className = 'search-button';
  filterBtn.textContent = 'Применить фильтр';

  form.appendChild(showAllBtn);
  form.appendChild(labelMin);
  form.appendChild(inputMin);
  form.appendChild(labelMax);
  form.appendChild(inputMax);
  form.appendChild(filterBtn);

  container.appendChild(form);

  // Обработчик "Показать всё"
  showAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const travelsContainer = document.querySelector('.travels');
    if (!travelsContainer) return;
    
    travelsContainer.innerHTML = '';
    
    // Удаляем старый счётчик
    const oldCount = document.querySelector('.travels-number');
    if (oldCount) oldCount.remove();

    try {
      const response = await fetch('/travels');
      if (!response.ok) throw new Error('Ошибка сети');
      
      const data = await response.json();
      allTravelsData = data;
      renderCards(data);
    } catch (error) {
      const errorParagraph = document.createElement('p');
      errorParagraph.className = 'error';
      errorParagraph.textContent = 'Ошибка загрузки данных';
      travelsContainer.appendChild(errorParagraph);
    }
  });

  // Обработчик фильтра
  filterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const minInput = document.getElementById('price_min');
    const maxInput = document.getElementById('price_max');
    
    const minVal = minInput.value ? Number(minInput.value) : 0;
    const maxVal = maxInput.value ? Number(maxInput.value) : Infinity;
    
    const filteredData = allTravelsData.filter(travel => {
      return travel.price >= minVal && travel.price <= maxVal;
    });
    
    renderCards(filteredData);
  });
}

function renderCards(travels) {
  const travelsContainer = document.querySelector('.travels');
  if (!travelsContainer) return;

  // Удаляем старый счётчик перед рендером
  const oldCount = document.querySelector('.travels-number');
  if (oldCount) oldCount.remove();

  travelsContainer.innerHTML = '';

  // Счётчик найденных
  const countContainer = document.createElement('div');
  countContainer.className = 'travels-number';
  countContainer.textContent = `Найдено: ${travels.length}`;
  travelsContainer.before(countContainer);

  if (travels.length === 0) {
    travelsContainer.innerHTML = '<p>Ничего не найдено</p>';
    return;
  }

  // Поиск минимальной цены для подсветки
  const minPrice = Math.min(...travels.map(t => t.price));

  travels.forEach(travel => {
    const card = document.createElement('div');
    card.className = 'card';

    const imgSrc = travel.images && travel.images.length > 0 ? travel.images[0] : '';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = travel.title;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = travel.title;

    const desc = document.createElement('p');
    desc.className = 'card-text';
    desc.textContent = travel.description;

    const price = document.createElement('h3');
    price.className = 'card-text';
    price.textContent = `От ${travel.price} ₽`;

    // Подсветка самой дешёвой цены
    if (travel.price === minPrice) {
      price.classList.add('text-success');
    }

    cardBody.appendChild(title);
    cardBody.appendChild(desc);
    cardBody.appendChild(price);
    card.appendChild(img);
    card.appendChild(cardBody);
    travelsContainer.appendChild(card);
  });
}
