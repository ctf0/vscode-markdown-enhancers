import {
    CodeLens,
    CodeLensProvider, Range, TextDocument
} from 'vscode'
import * as util from '../util'

export default class LensProvider implements CodeLensProvider {
    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        let btns = util.btns
        let links = []

        const text = document.getText()
        const re = new RegExp(/(?<=([ \t]+)?`{3}(\S+)?\s)([\s\S]*?)(?=\s([ \t]+)?`{3})/, 'g')
        const matches = text.matchAll(re);

        for (const match of matches) {
            let cmnd = match[0].replace(/^([ \t]+)?(\$)([ \t]+)?/gm, '')
            let pos = document.positionAt(match.index)
            let range = new Range(pos, pos.with(pos.line, pos.character + cmnd.length))
            let args = [{ text: cmnd }]

            links.push(
                new CodeLens(range, {
                    command: btns.run.cmnd,
                    title: btns.run.icon,
                    arguments: args
                }),
                new CodeLens(range, {
                    command: btns.copy.cmnd,
                    title: btns.copy.icon,
                    arguments: args
                })
            )
        }

        return links
    }
}
