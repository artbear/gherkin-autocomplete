import * as path from "path";
import * as vscode from "vscode";

export const fixturePath = path.join(__dirname, "..", "..", "test", "fixtures");

export async function newTextDocument(uri: vscode.Uri): Promise<vscode.TextDocument> {
    const textDocument = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(textDocument);
    return textDocument;
}

export async function addText(text: string) {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        await activeTextEditor.edit((textEditorEdit) => {
            textEditorEdit.insert(activeTextEditor.selection.anchor, text);
        });
    }
}

export async function clearActiveTextEditor() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        await activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            const range
                = new vscode.Range(new vscode.Position(0, 0), activeTextEditor.selection.anchor);
            editBuilder.delete(range);
        });
    }
}

export async function insertCursorAtEndOfFile() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        await activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
            activeTextEditor.selection = new vscode.Selection(lastLine.range.start, lastLine.range.end);

            editBuilder.delete(activeTextEditor.selection);
        });
    }
}

// TODO не проверено!
export async function replaceLastLine(text: string) {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        await activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
            const range
                = new vscode.Range(new vscode.Position(lastLine.lineNumber, 0), activeTextEditor.selection.anchor);
            editBuilder.replace(range, text);
        });
    }
}

export class TextBackuper {
    private text: string;
    public async save() {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            this.text = activeTextEditor.document.getText();
        }
    }
    public async restore() {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            await activeTextEditor.edit((textEditorEdit) => {
                const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
                const range
                    = new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(lastLine.range.end.line, lastLine.range.end.character));
                textEditorEdit.replace(range, this.text);
            });
        }
    }
}
