// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import CompletionCodeLensProvider from "./features/competionLensProvider";
import CompletionItemProvider from "./features/completionItemProvider";
import ReferenceProvider from "./features/referenceProvider";
import * as vscAdapter from "./vscAdapter";

import { Global } from "./global";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const global = Global.create(vscAdapter);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(["feature", "gherkin"], new CompletionItemProvider(global), ".")
        // vscode.languages.registerDefinitionProvider
    );
    context.subscriptions.push(
        vscode.languages.registerReferenceProvider(["feature", "gherkin"], new ReferenceProvider(global))
    );

    context.subscriptions.push(vscode.commands.registerCommand("gherkin-autocomplete.update", () => {
        global.updateCacheForAll();
        // vscode.commands.executeCommand("vscode.executeReferenceProvider", )
    }));

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(["feature", "gherkin"], new CompletionCodeLensProvider(global))
    );

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(
        (document: vscode.TextDocument) => {
            global.updateCacheOfTextDocument(document.uri);
    }));

    global.updateCacheForAll();

}
