import * as path from "path";
import "should";
import * as vscode from "vscode";

import { addText, clearActiveTextEditor, fixturePath, insertCursorAtEndOfFile, newTextDocument,
    TextBackuper } from "./helpers";

import { Global } from "../src/global";
// import * as vscAdapter from "../src/vscAdapter";

// const globals = Global.create(vscAdapter);

let textDocument: vscode.TextDocument;

async function getCompletionListFromCurrentPosition(): Promise<vscode.CompletionList> {
    const position = vscode.window.activeTextEditor.selection.anchor;

    const completionList = await vscode.commands.executeCommand<vscode.CompletionList>(
        "vscode.executeCompletionItemProvider",
        textDocument.uri,
        position
    );

    return completionList;
}

// Defines a Mocha test suite to group tests of similar kind together
// tslint:disable-next-line:only-arrow-functions
describe("Completion", function() {
    _backuper: TextBackuper;

    this.timeout(50000);
    this._backuper = new TextBackuper();

    before(async () => {
        const uriEmptyFile = vscode.Uri.file(path.join(fixturePath, "test.feature"));
        textDocument = await newTextDocument(uriEmptyFile);
        await this._backuper.save();
        // await globals.waitForCacheUpdate();
    });

    beforeEach(async () => {
        await insertCursorAtEndOfFile();
    });

    afterEach(async () => {
        await this._backuper.restore();
    });

    // Defines a Mocha unit test
    it("should show global functions", async () => {

        await addText(" я выв");

        const completionList = await getCompletionListFromCurrentPosition();
        const completions = completionList.items;

        completions.should.have.length(1, "wrong completions length");

        // const messageFunction = completions[0];
        // messageFunction.label.should.be.equal("Сообщить");
        // messageFunction.kind.should.be.equal(vscode.CompletionItemKind.Function);
        // messageFunction.insertText.should.be.equal("Сообщить(");

    });

});
