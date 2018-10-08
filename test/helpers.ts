import * as path from "path";
import * as vscode from "vscode";

export const fixturePath = path.join(__dirname, "..", "..", "test", "fixtures");

export async function newTextDocument(uri: vscode.Uri): Promise<vscode.TextDocument> {
    const textDocument = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(textDocument);
    return textDocument;
}

export async function addText(text: string) {
    await vscode.window.activeTextEditor.edit((textEditorEdit) => {
        textEditorEdit.insert(vscode.window.activeTextEditor.selection.anchor, text);
    });
}

export async function clearActiveTextEditor() {
    await vscode.window.activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
        const range
            = new vscode.Range(new vscode.Position(0, 0), vscode.window.activeTextEditor.selection.anchor);
        editBuilder.delete(range);
    });
}

export async function insertCursorAtEndOfFile() {
    // const textEditor = vscode.window.activeTextEditor;
    // const endPos = textEditor.visibleRanges[0].end;
    // const newSelPos = new vscode.Position(endPos.line, endPos.character);
    // // const selRange = [];
    // // selRange.push(newSelPos);
    // // textEditor.selections = selRange;
    // textEditor.selection = newSelPos;
    await vscode.window.activeTextEditor.edit((editBuilder: vscode.TextEditorEdit) => {
        const lastLine = vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.document.lineCount - 1);
        vscode.window.activeTextEditor.selection = new vscode.Selection(lastLine.range.end, lastLine.range.end);

        editBuilder.delete(vscode.window.activeTextEditor.selection);
    });
}

export class TextBackuper {
    private _text: string;
    public async save() {
        this._text = vscode.window.activeTextEditor.document.getText();
    }
    public async restore() {
        if (vscode.window.activeTextEditor) {
            await vscode.window.activeTextEditor.edit((textEditorEdit) => {
                if (vscode.window.activeTextEditor) {
                    const textEditor = vscode.window.activeTextEditor;
                    const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
                    const range
                        = new vscode.Range(
                            new vscode.Position(0, 0),
                            new vscode.Position(lastLine.range.end.line, lastLine.range.end.character));
                    textEditorEdit.replace(range, this._text);
                }
            });
        }
    }
}