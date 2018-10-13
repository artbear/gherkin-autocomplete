import * as glob from "glob";
import * as vscode from "vscode";

export function postMessage(description: string, interval?: number) {
    if (interval) {
        vscode.window.setStatusBarMessage(description, interval);
    } else {
        vscode.window.setStatusBarMessage(description);
    }

}

export function getConfiguration(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
}

export function getConfigurationKey(configuration: vscode.WorkspaceConfiguration, key: string) {
    return configuration.get(key);
}

export function getRootPath() {
    return vscode.workspace.rootPath;
}

export function findFilesForCache(searchPattern: string, rootPath: string) {
    const globOptions: glob.IOptions = {};
    globOptions.dot = true;
    globOptions.cwd = rootPath;
    globOptions.nocase = true;
    // glob >=7.0.0 contains this property
    // tslint:disable-next-line:no-string-literal
    globOptions["absolute"] = true;
    glob(searchPattern, globOptions, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        this.addtocachefiles(files, rootPath);
    });
}
