export const STORAGE_KEY = 'ubuntu-kurs-lernen-v1';
const DAY = 86400000;
const codeLines = ['let summe = 0;', 'for (const zahl of [1, 2, 3]) {', '  summe += zahl;', '}', 'console.log(summe);'];
export const cards = [
  { id: 'filter', question: 'Welche Aufgabe hat filter bei einem Array?', answer: 'filter behält die Elemente, für die die Bedingung wahr ist.' },
  { id: 'map', question: 'Was unterscheidet map von filter?', answer: 'map berechnet für jedes Element einen neuen Wert, statt Elemente nach einer Bedingung auszuwählen.' },
  { id: 'summe', question: 'Warum beginnt eine laufende Summe meist mit 0?', answer: '0 verändert eine Addition nicht und liefert auch für eine leere Folge die passende Anfangssumme.' }
];

export function freshState() {
  return { version: 1, prediction: false, parsons: false, order: [4, 2, 0, 3, 1], reviews: {} };
}

export function loadState(storage) {
  try {
    const data = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
    if (data?.version !== 1) return freshState();
    const state = freshState();
    state.prediction = data.prediction === true;
    state.parsons = state.prediction && data.parsons === true;
    if (Array.isArray(data.order) && data.order.every(Number.isInteger) && [...data.order].sort().join() === '0,1,2,3,4') state.order = data.order;
    for (const card of cards) {
      const r = data.reviews?.[card.id];
      if (r && Number.isInteger(r.level) && r.level >= 0 && r.level <= 3 && Number.isFinite(r.due) && r.due >= 0) {
        state.reviews[card.id] = { level: r.level, due: r.due };
      }
    }
    return state;
  } catch { return freshState(); }
}

export function checkPrediction(value) {
  return value.trim().replace(/\s*,\s*/g, ',') === '10,16';
}

export function moved(order, index, delta) {
  const result = [...order];
  const other = index + delta;
  if (index >= 0 && index < order.length && other >= 0 && other < order.length) {
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function schedule(previous, known, now) {
  const level = known ? Math.min((previous?.level || 0) + 1, 3) : 0;
  return { level, due: now + (known ? [1, 3, 7][level - 1] * DAY : 60000) };
}

export function mount(doc, storage, now = Date.now) {
  let state = loadState(storage);
  let currentCard;
  const el = id => doc.getElementById(id);
  function save() {
    try {
      if (!storage) throw new Error('Kein Speicher');
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      el('storage-status').textContent = 'Der Lernstand wird in diesem Browser gespeichert.';
    } catch { el('storage-status').textContent = 'Speichern nicht möglich. Der Lernstand gilt nur bis zum Neuladen.'; }
  }
  function render() {
    const allReviewed = state.parsons && cards.every(card => state.reviews[card.id]);
    el('path').replaceChildren();
    for (const [title, done, unlocked] of [
      ['Vorhersage', state.prediction, true],
      ['Parsons', state.parsons, state.prediction],
      ['Erste Kartenrunde', allReviewed, state.parsons]
    ]) {
      const item = doc.createElement('li');
      item.textContent = `${title}: ${done ? 'abgeschlossen' : unlocked ? 'bereit' : 'vorherigen Schritt lösen'}`;
      el('path').append(item);
    }
    el('parsons-controls').disabled = !state.prediction;
    el('card-controls').disabled = !state.parsons;
    el('lines').replaceChildren();
    state.order.forEach((line, index) => {
      const item = doc.createElement('li');
      const code = doc.createElement('code');
      code.textContent = codeLines[line];
      item.append(code);
      for (const [delta, label] of [[-1, 'Nach oben'], [1, 'Nach unten']]) {
        const button = doc.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.setAttribute('aria-label', `${label}: ${codeLines[line]}`);
        button.disabled = index + delta < 0 || index + delta >= codeLines.length;
        button.addEventListener('click', () => { state.order = moved(state.order, index, delta); save(); render(); });
        item.append(button);
      }
      el('lines').append(item);
    });
    currentCard = state.parsons ? cards.find(card => (state.reviews[card.id]?.due || 0) <= now()) : undefined;
    el('card-answer').hidden = true;
    el('card-ratings').hidden = true;
    el('card-reveal').disabled = !currentCard;
    el('card-question').textContent = currentCard?.question || (state.parsons ? 'Im Moment ist keine Karte fällig.' : 'Löse zuerst die Parsons-Aufgabe.');
    const pending = cards.filter(card => (state.reviews[card.id]?.due || 0) <= now()).length;
    el('card-status').textContent = state.parsons ? `${pending} fällige Karten. Neue Fälligkeiten werden beim Neuladen geprüft.` : '';
  }
  el('prediction-form').addEventListener('submit', event => {
    event.preventDefault();
    const correct = checkPrediction(el('prediction').value);
    if (correct) state.prediction = true;
    el('prediction-result').textContent = correct ? 'Richtig: 5 und 8 bleiben übrig und werden verdoppelt.' : 'Noch nicht. Prüfe erst filter, dann map, zuletzt join.';
    save(); render();
  });
  el('parsons-check').addEventListener('click', () => {
    if (!state.prediction) return;
    const correct = state.order.every((line, index) => line === index);
    if (correct) state.parsons = true;
    el('parsons-result').textContent = correct ? 'Richtig geordnet. Jetzt sind die Karten bereit.' : 'Noch nicht: Erst die Summe anlegen, dann die Schleife, zuletzt die Ausgabe.';
    save(); render();
  });
  el('card-reveal').addEventListener('click', () => {
    if (!currentCard || !state.parsons) return;
    el('card-answer').textContent = currentCard.answer;
    el('card-answer').hidden = false;
    el('card-ratings').hidden = false;
  });
  for (const [id, known] of [['card-again', false], ['card-known', true]]) {
    el(id).addEventListener('click', () => {
      if (!currentCard || !state.parsons || el('card-ratings').hidden) return;
      state.reviews[currentCard.id] = schedule(state.reviews[currentCard.id], known, now());
      save(); render();
    });
  }
  el('reset').addEventListener('click', () => {
    if (!doc.defaultView.confirm('Den gesamten Lernstand dieses Beispielkurses zurücksetzen?')) return;
    state = freshState();
    el('prediction-result').textContent = ''; el('parsons-result').textContent = '';
    el('prediction').value = '';
    save(); render();
  });
  save(); render();
}

if (typeof document !== 'undefined') {
  let storage;
  try { storage = window.localStorage; } catch { /* Oberfläche bleibt ohne Speicherung nutzbar. */ }
  mount(document, storage);
}
