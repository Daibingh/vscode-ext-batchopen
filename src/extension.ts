// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


function fileExist(file: string) {
    try {
        fs.readFileSync(file);
    } catch (err) {
        return false;
    }
    return true;
}

async function batchopen() {
    if (! vscode.workspace.workspaceFolders) {
        return;
    }
    const workdir: string = vscode.workspace.workspaceFolders[0].uri.fsPath;
    console.log(`workdir: ${workdir}`);
    const file : string = path.join(workdir, '.vscode', 'batchopen.py');
    console.log(`listfile: ${file}`);
    let data: string;
    let notfound : string[] = [];
    let cnt: number = 0;
    try {
        data = fs.readFileSync(file, "utf-8");
    } catch (err) {
        console.log(err);
        vscode.window.showInformationMessage(`can not find .vscode/batchopen.py!`);
        return;
    }

    for (let line of data.split('\n')) {
        line = line.trim();
        if (line.length === 0 || line.length > 1 && line[0] === '#') {
            continue;
        }
        if (line[0] === '/') {
            line = line.slice(1);
        }
        let matchedFileUri = vscode.Uri.file('');
        let success = true;
        if (line.indexOf('*') === -1) {
            const f = path.join(workdir, line);
            if (!fileExist(f)) {
                success = false;
            } else {
                matchedFileUri = vscode.Uri.file(f); 
            }
        } else {
            let u = await vscode.workspace.findFiles(line, null, 1);
            if (u.length === 0) {
                success = false;
            } else {
                matchedFileUri = u[0];
            }
        }
        if (!success) {
            console.log(`not found: ${line}`);
            notfound.push(line);
            continue;
        }
        console.log(`open: ${matchedFileUri.fsPath}`);
        await vscode.window.showTextDocument(matchedFileUri, {preview: false});
        cnt += 1;
    }
    let notfoundFile = path.join(workdir, '.vscode', 'notfound.txt');
    const opt: fs.WriteFileOptions = {encoding: 'utf8', flag: 'w'};
    fs.writeFileSync(notfoundFile, notfound.join('\n'), opt);
    vscode.window.showInformationMessage(`open ${cnt} files!`);
    vscode.window.showInformationMessage(`miss ${notfound.length} files! see .vscode/notfound.txt.`);
    if (notfound.length > 0) {
        vscode.window.showTextDocument(vscode.Uri.file(notfoundFile), {preview: false});
    }
}


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "batchopen" is now active!');
    let disposable = vscode.commands.registerCommand('batchopen.batchopen', batchopen);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
