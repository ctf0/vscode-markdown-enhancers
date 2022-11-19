import {
    TextDocument,
    Position,
    MarkdownString,
    Hover,
    Uri
} from 'vscode'
import * as util from './util'

export default class HoverProvider {
    provideHover(document: TextDocument, position: Position) {
        let btns = util.btns

        /* Short -------------------------------------------------------------------- */
        let range = document.getWordRangeAtPosition(position, new RegExp(/(?<=`)(?![`| ]).*?(?=[`])/, 'g'))

        if (range) {
            let text = this.cleanBlock(document.getText(range))
            let args = util.prepareArgs({text: text})

            const run = Uri.parse(`command:${btns.run.cmnd}?${args}`);
            const copy = Uri.parse(`command:${btns.copy.cmnd}?${args}`);

            let link = new MarkdownString('', true)
                    .appendMarkdown(`[${btns.run.icon}](${run})`)
                    .appendMarkdown(` | `)
                    .appendMarkdown(`[${btns.copy.icon}](${copy})`)
            link.isTrusted = true

            return new Hover(link, range)
        }

        /* Nested ------------------------------------------------------------------- */
        range = document.getWordRangeAtPosition(position, new RegExp(/^([ \t]+)?\$.*?$/, 'g'))

        if (range) {
            let text = this.cleanBlock(document.getText(range))
            let args = util.prepareArgs({text: text})

            const run = Uri.parse(`command:${btns.run.cmnd}?${args}`);
            const copy = Uri.parse(`command:${btns.copy.cmnd}?${args}`);

            let link = new MarkdownString('', true)
                    .appendMarkdown(`[${btns.run.icon}](${run})`)
                    .appendMarkdown(` | `)
                    .appendMarkdown(`[${btns.copy.icon}](${copy})`)
            link.isTrusted = true

            return new Hover(link, range)
        }
    }

    cleanBlock(text) {
        return text
                .replace(/^([ \t]+)?\$([ \t]+)?/g, '')
                .replace(/([ \t]+)?\/[\/|\*].*?$/g, '')
    }
}
