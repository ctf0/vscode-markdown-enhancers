import * as util from "../util";
import * as vscode from "vscode";
import escapeStringRegexp from 'escape-string-regexp';

let userMasks: any = []

export default async function TextDecoration(context: vscode.ExtensionContext) {
    init()
    events(context);
}

function init() {
    vscode.window.visibleTextEditors.map((editor) => setMasks(editor));

    if (userMasks.length) {
        util.MASK_EXTENSION_PROVIDER.addAdditionalMasks(userMasks)
    }
}

function maskCurrentEditor() {
    setMasks(vscode.window.activeTextEditor)

    if (userMasks.length) {
        util.MASK_EXTENSION_PROVIDER.addAdditionalMasks(userMasks)
    }
}

function events(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeVisibleTextEditors((editors) => {
        init()
    }, null, context.subscriptions);

    vscode.workspace.onDidSaveTextDocument((document) => {
        maskCurrentEditor()
    }, null, context.subscriptions);

    vscode.window.onDidChangeTextEditorSelection((event) => {
        maskCurrentEditor()
    }, null, context.subscriptions);
}

function setMasks(editor) {
    userMasks = [
        {
            "language": util.FILE_TYPE,
            "patterns": [
                ...linkDecor(editor)
            ]
        }
    ]
}

function linkDecor(editor) {
    let patterns: any = [];

    if (editor) {
        const { document } = editor
        const text = document.getText();
        const regEx = /(?<!\!)\[(?!\!)(.*?)\]\((.*?)\)/g;

        let match;

        while ((match = regEx.exec(text))) {
            let title = match[1]
            let link = match[2]

            let arg = encodeURIComponent(JSON.stringify([link]))
            let hover = link.startsWith('#')
                        ? getHoverText(title, vscode.Uri.parse(`command:workbench.action.gotoSymbol?${arg}`))
                        : getHoverText(title, link)

            patterns.push(
                {
                    "pattern": escapeStringRegexp(`[${title}](${link})`),
                    "replace": title,
                    "hover": hover,
                    "style": util.config.linkStyles
                },
            )
        }
    }

    return patterns
}

function getHoverText(title, link) {
    let md = new vscode.MarkdownString(`[${title}](${link})`)
    md.isTrusted = true

    return md
}
