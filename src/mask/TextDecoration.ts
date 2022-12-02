import * as vscode from "vscode";
import escapeStringRegexp from 'escape-string-regexp';

import * as util from "../util";
import MaskController from "./mask-controller";

let userMasks: any
export let MaskControllers: any = []

export function TextDecoration(context: vscode.ExtensionContext) {
    vscode.window.visibleTextEditors.map((editor) => setMasks(editor));
    events(context);
}

function maskCurrentEditor() {
    if (util.config.decorationSupport) {
        setMasks(vscode.window.activeTextEditor);
    } else {
        MaskControllers.map((item: MaskController) => item.clear())
    }
}

function setMasks(editor) {
    userMasks = [
        {
            "language": "markdown",
            "patterns": [
                ...linkDecor(editor)
            ]
        }
    ]

    maskEditor(editor)
}

function maskEditor(editor: vscode.TextEditor | undefined) {
    let old = MaskControllers.find((item: MaskController) => item.getEditor() === editor)

    // A map from language id => mask
    const maskMap = new Map<string, any>();
    const maskController = old || new MaskController(editor);
    let timeout: NodeJS.Timeout;

    async function updateMasks() {
        try {
            const document = maskController.getEditor()?.document;

            if (document) {
                for (let mask of userMasks) {
                    if (vscode.languages.match(mask.language, document) > 0) {
                        maskMap.set(mask.language, mask.pattern);

                        for (const pattern of mask.patterns) {
                            const regex = new RegExp(pattern.pattern, pattern.ignoreCase ? "ig" : "g");

                            maskController.apply(regex, {
                                text: pattern.replace,
                                hover: pattern.hover,
                                backgroundColor: pattern.style?.backgroundColor,
                                border: pattern.style?.border,
                                borderColor: pattern.style?.borderColor,
                                color: pattern.style?.color,
                                fontStyle: pattern.style?.fontStyle,
                                fontWeight: pattern.style?.fontWeight,
                                css: pattern.style?.css
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * Wait a little before updating the masks
     * To avoid slowing the extension down
     */
    function debounceUpdateMasks() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateMasks, 50);
    };

    debounceUpdateMasks();

    if (!old) {
        MaskControllers.push(maskController)
    }
}

function events(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        maskCurrentEditor()
    }, null, context.subscriptions);

    vscode.workspace.onDidSaveTextDocument((document) => {
        maskCurrentEditor()
    }, null, context.subscriptions);

    vscode.window.onDidChangeTextEditorSelection((event) => {
        maskCurrentEditor()
    }, null, context.subscriptions);
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
            let myContent = new vscode.MarkdownString(`[${title}](${link})`)
            myContent.isTrusted = true

            patterns.push(
                {
                    "pattern": escapeStringRegexp(`[${title}](${link})`),
                    "replace": title,
                    "hover": myContent,
                    "style": util.config.linkStyles
                },
            )
        }
    }

    return patterns
}
