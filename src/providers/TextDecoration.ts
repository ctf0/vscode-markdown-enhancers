import escapeStringRegexp from 'escape-string-regexp';
import * as vscode from "vscode";
import * as util from "../util";

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

        patterns.push(
            ...externalLinkRegex(text),
            ...complexLinkRegex(text),
            ...headerLinkRegex(text)
        )
    }

    return patterns
}

// []()
function externalLinkRegex(text) {
    const regEx = /(?<!\[\!)\[(?![\! ])(.*?)\]\((?!#)(.*?)\)/g;
    let patterns: any = []
    let match;

    while ((match = regEx.exec(text))) {
        let title = match[1]
        let link = match[2]

        patterns.push(
            {
                "pattern": escapeStringRegexp(`[${title}](${link})`),
                "replace": ` @${title} `,
                "hover": getHoverText(title, link),
                "style": util.config.linkStyles
            },
        )
    }

    return patterns
}

// [![]()]()
function complexLinkRegex(text) {
    let regEx = /\[!\[(.*?)\]\((.*?)\)(?=(\s|$))/g;
    let patterns: any = []
    let match;

    while ((match = regEx.exec(text))) {
        let title = match[1]
        let link = match[2]

        patterns.push(
            {
                "pattern": escapeStringRegexp(`[![${title}](${link})`),
                "replace": ` !${title} `,
                "style": util.config.linkStyles
            },
        )
    }

    return patterns
}

// [](#)
function headerLinkRegex(text) {
    const regEx = /(?<!\[\!)\[(?![\! ])(.*?)\]\((#.*?)\)/g;
    let patterns: any = []
    let match;

    while ((match = regEx.exec(text))) {
        let title = match[1]
        let link = match[2]

        patterns.push(
            {
                "pattern": escapeStringRegexp(`[${title}](${link})`),
                "replace": ` #${title} `,
                "style": util.config.linkStyles
            },
        )
    }

    return patterns
}

function getHoverText(title, link) {
    let md = new vscode.MarkdownString(`[${title}](${link})`)
    md.isTrusted = true

    return md
}
