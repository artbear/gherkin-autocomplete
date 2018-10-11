import * as path from "path";
import "should";
import * as vscode from "vscode";

import { addText, clearActiveTextEditor, fixturePath, insertCursorAtEndOfFile, newTextDocument,
    TextBackuper } from "./helpers";

import { Global } from "../src/global";
import * as vscAdapter from "../src/vscAdapter";

const globals = Global.create(vscAdapter);

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

    this.timeout(15000);
    this._backuper = new TextBackuper();

    before(async () => {
        const uriEmptyFile = vscode.Uri.file(path.join(fixturePath, "test", "test.feature"));
        textDocument = await newTextDocument(uriEmptyFile);
        await this._backuper.save();
        await globals.waitForCacheUpdate();
    });

    beforeEach(async () => {
        await insertCursorAtEndOfFile();
    });

    afterEach(async () => {
        await this._backuper.restore();
    });

    // Defines a Mocha unit test
    it("should show completions list for fuzzy eq", async () => {

        const addedText = " консол";
        await addText(addedText);
        const position = vscode.window.activeTextEditor.selection.anchor;

        const completionList = await getCompletionListFromCurrentPosition();
        const completions = completionList.items;

        completions.should.have.length(1, "wrong completions length");

        const item = completions[0];
        item.label.should.be.equal("я вижу консоль", "label");
        item.kind.should.be.equal(vscode.CompletionItemKind.Module);
        item.insertText.should.be.equal("я вижу консоль", "insertText");
        item.filterText.should.be.equal("я вижу консоль", "filterText");
        item.range.start.character.should.be.equal(2, "range.start.character");
        item.range.end.character.should.be.equal(position.character, "range.end.character");

    });

    it("should show completions list for left eq", async () => {

        const addedText = " я вижу";
        await addText(addedText);
        const position = vscode.window.activeTextEditor.selection.anchor;

        const completionList = await getCompletionListFromCurrentPosition();
        const completions = completionList.items;

        completions.should.have.length(1, "wrong completions length");

        const item = completions[0];
        item.label.should.be.equal("я вижу консоль", "label");
        item.kind.should.be.equal(vscode.CompletionItemKind.Module);
        item.insertText.should.be.equal("я вижу консоль", "insertText");
        item.filterText.should.be.equal("я вижу консоль", "filterText");
        item.range.start.character.should.be.equal(2, "range.start.character");
        item.range.end.character.should.be.equal(position.character, "range.end.character");

    });

    it("should show completions list for full eq", async () => {

        const addedText = " я вижу консоль";
        await addText(addedText);
        const position = vscode.window.activeTextEditor.selection.anchor;

        const completionList = await getCompletionListFromCurrentPosition();
        const completions = completionList.items;

        completions.should.have.length(1, "wrong completions length");

        const item = completions[0];
        item.label.should.be.equal("я вижу консоль", "label");
        item.kind.should.be.equal(vscode.CompletionItemKind.Module);
        item.insertText.should.be.equal("я вижу консоль", "insertText");
        item.filterText.should.be.equal("я вижу консоль", "filterText");
        item.range.start.character.should.be.equal(2, "range.start.character");
        item.range.end.character.should.be.equal(position.character, "range.end.character");

    });

});
