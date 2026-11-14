const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../beispiele/kurs-pruefer/erweiterung/extension.js'), 'utf8');

function host({ trusted = true, exists = true, saved = true } = {}) {
  const state = { tasks: [], errors: [], saves: 0, warnings: [] };
  const folder = { uri: { scheme: 'file', fsPath: '/tmp/Mein Kurs mit Leerzeichen' } };
  const vscode = {
    commands: { registerCommand(id, handler) { state.command = id; state.run = handler; return {}; } },
    workspace: {
      isTrusted: trusted, workspaceFolders: [folder],
      fs: { async stat() { if (!exists) throw new Error('Datei fehlt'); } },
      async saveAll() { state.saves++; return saved; }
    },
    window: {
      async showWarningMessage(text) { state.warnings.push(text); },
      async showErrorMessage(text) { state.errors.push(text); }
    },
    Uri: { joinPath(base, ...parts) { return { fsPath: path.join(base.fsPath, ...parts) }; } },
    ProcessExecution: class { constructor(command, args, options) { Object.assign(this, { command, args, options }); } },
    Task: class { constructor(definition, scope, name, source, execution) { Object.assign(this, { definition, scope, execution }); } },
    TaskGroup: { Test: 'test' }, TaskRevealKind: { Always: 1 },
    tasks: { async executeTask(task) { state.tasks.push(task); } }
  };
  const context = { require(name) { assert.equal(name, 'vscode'); return vscode; }, module: { exports: {} } };
  vm.runInNewContext(source, context);
  context.module.exports.activate({ subscriptions: [] });
  return state;
}

test('Startet denselben Python-Test mit festem Arbeitsordner und einzelnen Argumenten', async () => {
  const state = host(); await state.run();
  assert.equal(state.command, 'kursPruefer.pruefen');
  assert.equal(state.tasks.length, 1);
  const execution = state.tasks[0].execution;
  assert.equal(execution.command, 'python3');
  assert.deepEqual(Array.from(execution.args), ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_aufgabe.py', '-v']);
  assert.equal(execution.options.cwd, '/tmp/Mein Kurs mit Leerzeichen');
  assert.equal(state.saves, 1);
});
test('Startet keinen Code ohne Workspace-Vertrauen', async () => {
  const state = host({ trusted: false }); await state.run();
  assert.equal(state.tasks.length, 0); assert.equal(state.warnings.length, 1);
});
test('Erkennt einen falschen Kursordner', async () => {
  const state = host({ exists: false }); await state.run();
  assert.equal(state.tasks.length, 0); assert.equal(state.errors.length, 1);
});
test('Startet keinen Prüflauf, wenn das Speichern scheitert', async () => {
  const state = host({ saved: false }); await state.run();
  assert.equal(state.tasks.length, 0);
});
