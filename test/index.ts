"use strict";

import * as fs from "fs";
import * as glob from "glob";
import * as paths from "path";

const Mocha = require("mocha");

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implementt he method statically
const tty = require("tty");
if (!tty.getWindowSize) {
    tty.getWindowSize = (): number[] => {
        return [80, 75];
    };
}

let mocha = new Mocha({
    ui: "bdd",
    useColors: true,
});

function configure(mochaOpts): void {
    mocha = new Mocha(mochaOpts);
}
exports.configure = configure;

function run(testsRoot, clb): any {
    // Enable source map support

    // Glob test files
    glob("**/**.test.js", { cwd: testsRoot }, (error, files): any => {
        if (error) {
            return clb(error);
        }
        try {
            // Fill into Mocha
            files.forEach((f): Mocha => {
                return mocha.addFile(paths.join(testsRoot, f));
            });
            // Run the tests
            let failureCount = 0;

            mocha.run()
                .on("fail", (): void => {
                failureCount++;
            })
            .on("end", (): void => {
                clb(undefined, failureCount);
            });
        } catch (error) {
            return clb(error);
        }
    });
}
exports.run = run;
