import * as path from "path";
import * as should from "should";
import * as vscode from "vscode";

import { addText, clearActiveTextEditor, fixturePath, insertCursorAtEndOfFile, newTextDocument,
    TextBackuper } from "./helpers";

import { Global } from "../src/global";
import * as vscAdapter from "../src/vscAdapter";

const globals = Global.create(vscAdapter);

let textDocument: vscode.TextDocument;

async function getCompletionListFromCurrentPosition(): Promise<vscode.CompletionList> {
    if (vscode.window.activeTextEditor) {
        const position = vscode.window.activeTextEditor.selection.anchor;

        const completionList = await vscode.commands.executeCommand<vscode.CompletionList>(
            "vscode.executeCompletionItemProvider",
            textDocument.uri,
            position
        );

        if (completionList) {
            return completionList;
        }
    }
    return new vscode.CompletionList();
}

// Defines a Mocha test suite to group tests of similar kind together
// tslint:disable-next-line:only-arrow-functions
describe("Completion", function() {
    let backuper: TextBackuper;
    let activeTextEditor: vscode.TextEditor | undefined;
    let stepText = "я вижу консоль";

    this.timeout(15000);
    backuper = new TextBackuper();

    before(async () => {
        const uriEmptyFile = vscode.Uri.file(path.join(fixturePath, "test", "test.feature"));
        textDocument = await newTextDocument(uriEmptyFile);
        activeTextEditor = vscode.window.activeTextEditor;
        should(activeTextEditor).is.not.undefined();
        await backuper.save();
        await globals.waitForCacheUpdate();
    });

    beforeEach(async () => {
        await insertCursorAtEndOfFile();
    });

    afterEach(async () => {
        await backuper.restore();
    });

    it("should show completions list for fuzzy eq", async () => {
        await checkCompletion(" И консол");
    });

    it("should show completions list for left eq", async () => {
        await checkCompletion(" И я вижу");
    });

    it("should show completions list for full eq", async () => {
        await checkCompletion(" И я вижу консоль");
    });

    it("should show completions list for fuzzy eq export scenarios", async () => {
        stepText = "Специальный экспортный сценарий";
        await checkCompletion(" И экспорт");
    });

    it("should show completions list for left eq export scenarios", async () => {
        await checkCompletion(" И Специальный экспортный");
    });

    it("should show completions list for full eq export scenarios", async () => {
        await checkCompletion(" И Специальный экспортный сценарий");
    });

    async function checkCompletion(addedText: string) {

        if (!activeTextEditor) {
            Object(null).should.not.null("activeTextEditor");
            return;
        }

        await addText(addedText);
        const position = activeTextEditor.selection.anchor;

        const completionList = await getCompletionListFromCurrentPosition();
        const completions = completionList.items;

        completions.should.have.length(1, "wrong completions length");

        const item = completions[0];
        if (!item.kind || !item.insertText || !item.filterText || !item.range
            || !item.documentation) {
                should(item.kind).is.not.undefined();
                should(item.insertText).is.not.undefined();
                should(item.filterText).is.not.undefined();
                should(item.range).is.not.undefined();
                should(item.documentation).is.not.undefined();
                return;
            }

        item.insertText.should.be.equal(stepText, "insertText");
        item.filterText.should.be.equal(stepText, "filterText");
        item.label.should.be.equal(stepText, "label");
        item.documentation.should.be.equal("Feature: ..\\lib\\FEATURES\\Фича с пробелами.feature", "documentation");
        item.range.start.character.should.be.equal(2, "range.start.character");
        item.range.end.character.should.be.equal(position.character, "range.end.character");
        item.kind.should.be.equalOneOf([
            vscode.CompletionItemKind.Module,
            vscode.CompletionItemKind.Interface]
        );

    }

});
