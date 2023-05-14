import escapeStringRegexp from 'escape-string-regexp';
import pDebounce from 'p-debounce';
import * as vscode from 'vscode';
import * as util from '../util';

let userMasks: any = [];

export default async function TextDecoration(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeVisibleTextEditors((editors) => init()),
        vscode.workspace.onDidSaveTextDocument(async (document) => await maskCurrentEditor()),
        vscode.window.onDidChangeTextEditorSelection(pDebounce(async (event) => await maskCurrentEditor(), 200)),
    );
}

function init() {
    vscode.window.visibleTextEditors.map(async (editor) => await setMasks(editor));
    applyMasks();
}

async function maskCurrentEditor() {
    await setMasks(vscode.window.activeTextEditor);
    applyMasks();
}

async function setMasks(editor) {
    const FILE_TYPE = util.FILE_TYPE;
    const check = editor &&
        ['file', 'untitled'].includes(editor.document.uri.scheme) &&
        editor.document.languageId === FILE_TYPE;

    if (!check) {
        return;
    }

    userMasks = [
        {
            language : FILE_TYPE,
            patterns : [
                ...await linkDecor(editor),
            ],
        },
    ];
}

function applyMasks() {
    if (userMasks.length) {
        util.MASK_EXTENSION_PROVIDER.addAdditionalMasks(userMasks);
    }
}

async function linkDecor(editor) {
    const patterns: any = [];
    const { document } = editor;
    const text = document.getText();

    patterns.push(
        ...await externalLinkRegex(text),
        ...await complexLinkRegex(text),
        ...await headerLinkRegex(text),
        ...await imgLinkRegex(text),
    );

    return patterns;
}

// []()
function externalLinkRegex(text) {
    return new Promise((resolve, reject) => {
        const regEx = /(?<!(\[\!|\!))\[(?![\! ])(.*?)\]\((?!#)(.*?)\)/g;
        const patterns: any = [];
        let match;

        while ((match = regEx.exec(text))) {
            const title = match[2];
            const link = match[3];

            patterns.push(
                {
                    pattern : escapeStringRegexp(match[0]),
                    replace : ` @${title} `,
                    hover   : getHoverText(title, link),
                    style   : util.config.linkStyles,
                },
            );
        }

        resolve(patterns);
    });
}

// [![]()]()
function complexLinkRegex(text) {
    return new Promise((resolve, reject) => {
        const regEx = /\[!\[(.*?)\]\((.*?)\)\]\s?\((.*?)\)/g;
        const patterns: any = [];
        let match;

        while ((match = regEx.exec(text))) {
            const title = match[1];
            const link = match[2];
            const TitleOrLast = title || match[3];

            patterns.push(
                {
                    pattern : escapeStringRegexp(match[0]),
                    replace : ` !${TitleOrLast} `,
                    hover   : getHoverText(TitleOrLast, link),
                    style   : util.config.linkStyles,
                },
            );
        }

        resolve(patterns);
    });
}

// [](#)
function headerLinkRegex(text) {
    return new Promise((resolve, reject) => {
        const regEx = /(?<!\[\!)\[(?![\! ])(.*?)\]\((#.*?)\)/g;
        const patterns: any = [];
        let match;

        while ((match = regEx.exec(text))) {
            const title = match[1];
            const link = match[2];
            const TitleOrLink = title || link;

            patterns.push(
                {
                    pattern : escapeStringRegexp(match[0]),
                    replace : ` #${TitleOrLink} `,
                    hover   : getHoverText(TitleOrLink, link),
                    style   : util.config.linkStyles,
                },
            );
        }

        resolve(patterns);
    });
}

// ![]()
function imgLinkRegex(text) {
    return new Promise((resolve, reject) => {
        const regEx = /(?<!\[)\!\[(.*?)\]\((.*?)\)/g;
        const patterns: any = [];
        let match;

        while ((match = regEx.exec(text))) {
            const title = match[1];
            const link = match[2];
            const TitleOrLink = title || link;

            patterns.push(
                {
                    pattern : escapeStringRegexp(match[0]),
                    replace : ` !${TitleOrLink} `,
                    hover   : getHoverText(TitleOrLink, link),
                    style   : util.config.linkStyles,
                },
            );
        }

        resolve(patterns);
    });
}

function getHoverText(title, link) {
    const md = new vscode.MarkdownString(`[${title}](${link})`);
    md.isTrusted = true;

    return md;
}
