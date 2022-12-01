import HoverProvider from './providers/CodeHoverProvider';
import LensProvider from './providers/CodeLensProvider';
import {MaskControllers, TextDecoration} from './mask/TextDecoration';
import * as vscode from 'vscode'
import * as util from './util'
import MaskController from './mask/mask-controller';

export function activate(context: vscode.ExtensionContext) {
    util.setConfig()

    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(util.PACKAGE_NAME)) {
            util.setConfig()
            useDecoration(context)
        }
    }, null, context.subscriptions);

    context.subscriptions.push(
        vscode.languages.registerHoverProvider([util.FILE_TYPE], new HoverProvider()),
        vscode.languages.registerCodeLensProvider([util.FILE_TYPE], new LensProvider()),

        /* Commands ----------------------------------------------------------------- */
        vscode.commands.registerCommand(util.btns.run.cmnd, ({text}) => {
            let terminal: vscode.Terminal = util.getTerminalWindow()
            terminal.show()
            terminal.sendText(text)
        }),
        vscode.commands.registerCommand(util.btns.copy.cmnd, ({text}) => {
            vscode.env.clipboard.writeText(text).then(() => {
                vscode.window.showInformationMessage(`${util.pkgTitle()}: '${text}' Copied To Clipboard`)
            })
        })
    )

    useDecoration(context)
}

function useDecoration(context) {
    if (util.config.decorationSupport) {
        TextDecoration(context)
    } else {
        MaskControllers.map((item: MaskController) => item.clear())
    }
}

export function deactivate() { }
