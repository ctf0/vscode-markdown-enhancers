import {
    CodeLens,
    CodeLensProvider, Range, TextDocument,
} from 'vscode';
import * as util from '../util';

export default class LensProvider implements CodeLensProvider {
    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        const btns = util.btns;
        const links = [];

        const text = document.getText();
        const re = new RegExp(/(?<=([ \t]+)?`{3}\S+\s)(.|\s)*?(?=\s([ \t]+)?`{3})/, 'g');

        const matches = text.matchAll(re);

        for (const match of matches) {
            const cmnd = match[0].replace(/^([ \t]+)?(\$)([ \t]+)?/gm, '');
            const pos = document.positionAt(match.index);
            const range = new Range(pos, pos.with(pos.line, pos.character + cmnd.length));
            const args = [{ text: cmnd }];

            links.push(
                new CodeLens(range, {
                    command   : btns.run.cmnd,
                    title     : btns.run.icon,
                    arguments : args,
                }),
                new CodeLens(range, {
                    command   : btns.copy.cmnd,
                    title     : btns.copy.icon,
                    arguments : args,
                }),
            );
        }

        return links;
    }
}
