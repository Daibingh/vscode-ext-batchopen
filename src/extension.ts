// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

async function batchopen() {
	if (! vscode.workspace.workspaceFolders) {
		return;
	}
	const workdir: string = vscode.workspace.workspaceFolders[0].uri.fsPath;
	console.log(`workdir: ${workdir}`);
	const file : string = path.join(workdir, '.vscode', 'batchopen.py');
	console.log(`workdir: ${file}`);
	let data: string;
	let notfound : string[] = [];
	let cnt: number = 0;
	try {
		data = fs.readFileSync(file, "utf-8");
	} catch (err) {
		console.log(err);
		return;
	}

	for (let line of data.split('\n')) {
		if (line.length === 0 || line.length > 1 && line[0] === '#') {
			continue;
		}
		if (line[0] === '/') {
			line = line.slice(1);
		}
		const u = await vscode.workspace.findFiles(line, null, 1);
		if (u.length === 0) {
			console.log(`not found: ${line}`);
			notfound.push(line);
			continue;
		}
		console.log(`open: ${u[0].fsPath}`);
		const options = {
			preview: false
		};
		vscode.window.showTextDocument(u[0], options);
		cnt += 1;
	}

	const opt: fs.WriteFileOptions = {encoding: 'utf8', flag: 'w'};
	fs.writeFileSync(path.join(workdir, '.vscode', 'notfound.txt'), notfound.join('\n'), opt);
	vscode.window.showInformationMessage(`open ${cnt} files!`);
	vscode.window.showInformationMessage(`miss ${notfound.length} files! see .vscode/notfound.txt.`);
}


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "batchopen" is now active!');
	let disposable = vscode.commands.registerCommand('batchopen.batchopen', batchopen);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
