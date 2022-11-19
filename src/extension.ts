import HoverProvider from './CodeHoverProvider';
import LensProvider from './CodeLensProvider';
import * as vscode from 'vscode'
import * as util from './util'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider([util.FILE_TYPE], new HoverProvider()),
        vscode.languages.registerCodeLensProvider([util.FILE_TYPE], new LensProvider()),
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
}

export function deactivate() { }
