import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { mount, freshState, loadState, schedule, STORAGE_KEY } from '../beispiele/kurs-lernen/kurs-lernen.js';

const requireTools = createRequire(import.meta.url);
const { JSDOM } = requireTools('jsdom');
const html = readFileSync(new URL('../beispiele/kurs-lernen/index.html', import.meta.url), 'utf8');
function setup(storageValue) {
  const dom = new JSDOM(html, { url: 'http://127.0.0.1:8000' });
  const storage = dom.window.localStorage;
  if (storageValue) storage.setItem(STORAGE_KEY, JSON.stringify(storageValue));
  mount(dom.window.document, storage, () => 1000000);
  return { doc: dom.window.document, win: dom.window, storage };
}

test('Falsche Vorhersage sperrt Parsons; richtige Antwort schaltet frei', () => {
  const { doc, win } = setup();
  doc.getElementById('prediction').value = '4';
  doc.getElementById('prediction-form').dispatchEvent(new win.Event('submit', { cancelable: true }));
  assert.equal(doc.getElementById('parsons-controls').disabled, true);
  doc.getElementById('prediction').value = '10, 16';
  doc.getElementById('prediction-form').dispatchEvent(new win.Event('submit', { cancelable: true }));
  assert.equal(doc.getElementById('parsons-controls').disabled, false);
});

test('Falsche Reihenfolge sperrt Karten, Verschieben löst die Aufgabe', () => {
  const state = freshState(); state.prediction = true;
  const { doc } = setup(state);
  doc.getElementById('parsons-check').click();
  assert.equal(doc.getElementById('card-controls').disabled, true);
  // Von [4,2,0,3,1] nach [0,1,2,3,4], mit denselben Schaltflächen wie im Browser.
  for (const [position, moves] of [[2, 2], [4, 3], [3, 1], [4, 1]]) {
    let index = position;
    for (let i = 0; i < moves; i++, index--) {
      doc.querySelectorAll('#lines li')[index].querySelector('button').click();
    }
  }
  doc.getElementById('parsons-check').click();
  assert.equal(doc.getElementById('card-controls').disabled, false);
});

test('Karten bewerten, speichern, neuladen und zurücksetzen', () => {
  const state = freshState(); state.prediction = state.parsons = true;
  const { doc, win, storage } = setup(state);
  for (let i = 0; i < 3; i++) {
    doc.getElementById('card-reveal').click();
    assert.equal(doc.getElementById('card-answer').hidden, false);
    doc.getElementById('card-known').click();
  }
  assert.match(doc.getElementById('card-status').textContent, /0 fällige/);
  assert.equal(Object.keys(loadState(storage).reviews).length, 3);
  const reloaded = setup(loadState(storage));
  assert.match(reloaded.doc.getElementById('card-status').textContent, /0 fällige/);
  win.confirm = () => true;
  doc.getElementById('reset').click();
  assert.equal(loadState(storage).prediction, false);
  assert.equal(doc.getElementById('parsons-controls').disabled, true);
});

test('Wiederholungsplan setzt korrekte Fälligkeiten statt FSRS vorzutäuschen', () => {
  const first = schedule(undefined, true, 1000);
  assert.equal(first.due, 1000 + 86400000);
  assert.equal(schedule(first, true, 2000).due, 2000 + 3 * 86400000);
  assert.deepEqual(schedule(first, false, 3000), { level: 0, due: 63000 });
});

test('Beschädigter oder gesperrter Speicher verhindert den Kursstart nicht', () => {
  assert.deepEqual(loadState({ getItem() { return '{kaputt'; } }), freshState());
  const { doc } = setup();
  const dom = new JSDOM(html);
  mount(dom.window.document, { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
  assert.match(dom.window.document.getElementById('storage-status').textContent, /Speichern nicht möglich/);
  assert.equal(doc.getElementById('parsons-controls').disabled, true);
});
