const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand(
    'kursPruefer.pruefen', async () => {
      if (!vscode.workspace.isTrusted) {
        await vscode.window.showWarningMessage('Vertraue zuerst dem Kursordner.');
        return;
      }
      const folders = vscode.workspace.workspaceFolders || [];
      const folder = folders.length === 1
        ? folders[0]
        : await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Kursordner auswählen' });
      if (!folder) return;
      if (folder.uri.scheme !== 'file') {
        await vscode.window.showErrorMessage('Öffne einen lokalen Kursordner.');
        return;
      }
      try {
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(folder.uri, 'aufgabe.py'));
        await vscode.workspace.fs.stat(vscode.Uri.joinPath(folder.uri, 'tests', 'test_aufgabe.py'));
        if (!await vscode.workspace.saveAll(false)) return;
        const task = new vscode.Task(
          { type: 'kurs-pruefer' }, folder, 'Aufgabe prüfen', 'Kurs-Prüfer',
          new vscode.ProcessExecution('python3', [
            '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_aufgabe.py', '-v'
          ], { cwd: folder.uri.fsPath }), []
        );
        task.group = vscode.TaskGroup.Test;
        task.presentationOptions = { reveal: vscode.TaskRevealKind.Always, clear: true };
        await vscode.tasks.executeTask(task);
      } catch (error) {
        await vscode.window.showErrorMessage(
          `Kursprüfung nicht gestartet: ${error.message}. Öffne den Kursordner mit aufgabe.py und tests/.`
        );
      }
    }
  ));
}

module.exports = { activate };
