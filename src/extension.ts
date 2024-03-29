import * as vscode from 'vscode';
import HoverProvider from './providers/CodeHoverProvider';
import LensProvider from './providers/CodeLensProvider';
import TextDecoration from './providers/TextDecoration';
import * as util from './util';

export async function activate(context: vscode.ExtensionContext) {
    await util.maskExtensionProviderInit();
    util.setConfig();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(util.PACKAGE_NAME)) {
                util.setConfig();
                useDecoration(context);
            }
        }),

        vscode.languages.registerHoverProvider([util.FILE_TYPE], new HoverProvider()),
        vscode.languages.registerCodeLensProvider([util.FILE_TYPE], new LensProvider()),

        /* Commands ----------------------------------------------------------------- */
        vscode.commands.registerCommand(util.btns.run.cmnd, ({ text }) => {
            const terminal: vscode.Terminal = util.getTerminalWindow();
            terminal.show();
            terminal.sendText(text);
        }),
        vscode.commands.registerCommand(util.btns.copy.cmnd, ({ text }) => {
            vscode.env.clipboard.writeText(text).then(() => {
                vscode.window.showInformationMessage(`${util.pkgTitle()}: '${text}' Copied To Clipboard`);
            });
        }),
    );

    useDecoration(context);
}

function useDecoration(context: vscode.ExtensionContext) {
    if (util.config.decorationSupport) {
        TextDecoration(context);
    } else {
        util.MASK_EXTENSION_PROVIDER.clearMaskDecorations();
    }
}

export function deactivate() { }
