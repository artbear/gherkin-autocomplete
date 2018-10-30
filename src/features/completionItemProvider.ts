import * as path from "path";
import * as vscode from "vscode";

import { IMethodValue } from "../IMethodValue";
import AbstractProvider from "./abstractProvider";

const Gherkin = require("gherkin");
const parser = new Gherkin.Parser();
const Token = require("./../../../node_modules/gherkin/lib/gherkin/token");
const GherkinLine = require("./../../../node_modules/gherkin/lib/gherkin/gherkin_line");

export default class GlobalCompletionItemProvider extends AbstractProvider implements vscode.CompletionItemProvider {
    private added: object = {};

    // tslint:disable-next-line:max-line-length
    public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.CompletionItem | Thenable<vscode.CompletionItem> {

        return item;
    }

    // tslint:disable-next-line:cognitive-complexity TODO
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        cansellationToken: vscode.CancellationToken,
        context: vscode.CompletionContext): Thenable<vscode.CompletionItem[]> {

        this.added = {};

        return new Promise((resolve, reject) => {

            const bucket = new Array<vscode.CompletionItem>();
            const textLine: vscode.TextLine = document.lineAt(position.line);

            const filename = document.uri;
            let languageInfo = this._global.getLanguageInfo(filename);
            if (languageInfo == null) {
                let gherkinDocument;
                try {
                    gherkinDocument = parser.parse(document.getText());
                    languageInfo = {
                        language: gherkinDocument.feature.language,
                        name: document.uri.fsPath
                    };
                } catch (error) {
                    console.error("provideCompletionItems error parse file " + filename + ":" + error);
                    resolve(bucket);
                    return;
                }
            }
            const TokenMatcher = new Gherkin.TokenMatcher(languageInfo.language);

            const line = new GherkinLine(textLine.text, position.line);
            const token = new Token(line, position.line);
            const matches: boolean = TokenMatcher.match_StepLine(token);

            if (!matches) {
                console.log("not mathed token for " + textLine.text);
                return resolve(bucket);
            }

            const word: string = token.matchedText;
            const startPos = new vscode.Position(position.line, token.matchedKeyword.length);
            const replaceRange = new vscode.Range(startPos, position);

            const wordRange: vscode.Range | undefined = document.getWordRangeAtPosition(position);
            const wordcomplite: string = wordRange == null ? "" :
                document.getText(
                    new vscode.Range(wordRange.start, position)
            );
            console.log("compiler for <" + word + "> - wordcomplite <" + wordcomplite + ">");

            const snippetFuzzy = this._global.toSnippet(word, false);

            let result = this._global.queryExportSnippet(filename, snippetFuzzy);
            result.forEach((value: IMethodValue, index: any, array: any) => {

                if (this.added[value.id] !== true) {
                    const item = new vscode.CompletionItem(value.name);
                    item.range = replaceRange;
                    item.insertText = value.name;
                    item.sortText = "3";
                    item.filterText = value.name;
                    console.log("queryExportSnippet value.name " + value.name);

                    item.documentation = this.makeDocumentation(value);
                    item.kind = vscode.CompletionItemKind.Interface;

                    bucket.push(item);
                    this.added[value.id] = true;
                }
            });

            result = this._global.getCacheLocal(filename.fsPath, word, document.getText(), false, true, false);
            result.forEach((value: IMethodValue, index: any, array: any) => {
                if (this.added[value.id] !== true) {
                    if (value.name === word) { return; } // TODO

                    const item = new vscode.CompletionItem(value.name);
                    item.sortText = "0";
                    item.insertText = value.name;
                    item.filterText = value.name;
                    item.range = replaceRange;

                    item.documentation = this.makeDocumentation(value);
                    item.kind = vscode.CompletionItemKind.Function;

                    bucket.push(item);
                    this.added[value.id] = true;
                }
            });

            result = this._global.querySnippet(filename, snippetFuzzy);
            result.forEach((value: IMethodValue, index: any, array: any) => {
                if (this.added[value.id] !== true) {
                    // TODO if (value.name === word && filename.fsPath === value.filename) {
                    //     return;
                    // }
                    const item = new vscode.CompletionItem(value.name);
                    item.insertText = value.name;
                    item.sortText = "0";
                    item.range = replaceRange;

                    item.filterText = value.name;
                    item.documentation = this.makeDocumentation(value);
                    item.kind = vscode.CompletionItemKind.Function;

                    bucket.push(item);
                    this.added[value.id] = true;
                }
            });
            resolve(bucket);

            return;
        });
    }

    private makeDocumentation(value: IMethodValue): string {
        const featureFilename = this.relativePath(vscode.Uri.file(value.filename));
        let documentation = (value.description ? value.description + "\n" : "");
        documentation = (value.filename ? "Feature: " + featureFilename : "");
        return documentation;
    }

    private relativePath(filename: vscode.Uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(filename);
        let rootFolder: vscode.Uri = vscode.Uri.file(this._global.getRootPath());
        if (workspaceFolder && workspaceFolder.uri) {
            rootFolder = workspaceFolder.uri;
        }

        const relPath = path.relative(rootFolder.fsPath, filename.fsPath);

            // // If the path leaves the current working directory, then we need to
            // // resolve the absolute path so that the path can be properly matched
            // // by minimatch (via multimatch)
            // // if (/^\.\.[\\/]/.test(relPath)) {
            // //    relPath = path.resolve(relPath);
            // // }
        return relPath;
    }

}

interface IObjOffset {
    index: number;
    offset: number;
}
