/* eslint-disable */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { jest, expect, test, beforeEach, afterEach } = require('@jest/globals');
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import testingLibrary from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import run from '../src/app.js';
import travelsFixture from '../__fixtures__/response.js';

const { screen, waitFor } = testingLibrary;

let elements;

beforeEach(() => {

  global.fetch = jest.fn();

  const pathToFixture = path.join('__fixtures__', 'index.html');
  const html = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = html;

  run();

  elements = {
    showAllBtn: screen.getByRole('button', { name: /показать всё/i }),
    minInput: screen.getByLabelText(/цена от/i),
    maxInput: screen.getByLabelText(/цена до/i),
    filterBtn: screen.getByRole('button', { name: /применить фильтр/i }),
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

//
// STEP 1 — Проверка отрисовки формы
//
test('Step 1: form is rendered correctly with all inputs and buttons', () => {
  const form = document.querySelector('.search-form');
  expect(form).toBeInTheDocument();

  expect(elements.minInput).toBeInTheDocument();
  expect(elements.maxInput).toBeInTheDocument();
  expect(elements.showAllBtn).toBeInTheDocument();
  expect(elements.filterBtn).toBeInTheDocument();
});

//
// STEP 2 — Проверка загрузки и ошибок
//
test('Step 2: fetches and displays data on "Показать всё" or shows error', async () => {
  // ✅ Успешный ответ
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => travelsFixture,
  });

  await userEvent.click(elements.showAllBtn);

  await waitFor(() => {
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBe(travelsFixture.length);
    expect(screen.getByText(`Найдено: ${travelsFixture.length}`)).toBeInTheDocument();
  });

  // ❌ Ошибка от сервера
  global.fetch.mockResolvedValueOnce({
    ok: false,
  });

  await userEvent.click(elements.showAllBtn);

  await waitFor(() => {
    expect(screen.getByText(/ошибка загрузки/i)).toBeInTheDocument();
  });
});

//
// STEP 3 — Проверка отрисовки карточек
//
test('Step 3: renders correct travel cards', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => travelsFixture,
  });

  await userEvent.click(elements.showAllBtn);

  await waitFor(() => {
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBe(travelsFixture.length);

    cards.forEach((card, index) => {
      const data = travelsFixture[index];

      const img = card.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(card.querySelector('.card-title')).toHaveTextContent(data.title);
      expect(card.querySelector('p.card-text')).toHaveTextContent(data.description);
     const expectedText = `От ${data.price} ₽`;
     expect(card.querySelector('h3.card-text').textContent).toContain(expectedText);
    });
  });
});

//
// STEP 4 — Проверка фильтра по цене и выделения минимальной цены
//
test('Step 4: filters by price range and highlights min price in green', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => travelsFixture,
  });

  await userEvent.click(elements.showAllBtn);

  await waitFor(() => {
    // Ищем минимальную цену
    const minPrice = Math.min(...travelsFixture.map((t) => t.price));
    const highlighted = document.querySelector('.card-text.text-success');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted.textContent).toContain(minPrice.toString());
  });

  // Применим фильтр
  await userEvent.clear(elements.minInput);
  await userEvent.clear(elements.maxInput);
  await userEvent.type(elements.minInput, '20000');
  await userEvent.type(elements.maxInput, '50000');
  await userEvent.click(elements.filterBtn);

  await waitFor(() => {
    const filtered = travelsFixture.filter((t) => t.price >= 20000 && t.price <= 50000);
    const cards = document.querySelectorAll('.card');
    expect(cards.length).toBe(filtered.length);

    filtered.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });

    const summary = screen.getByText(`Найдено: ${filtered.length}`);
    expect(summary).toBeInTheDocument();
  });
});
