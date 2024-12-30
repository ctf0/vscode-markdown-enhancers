import {
    CodeLens,
    CodeLensProvider, Range, TextDocument,
} from 'vscode';
import * as util from '../util';

const re = new RegExp(/(?<=([ \t]+)?`{3}[^`]\S+\s)(.|\s)+(?=\s([ \t]+)?`{3})/, 'g');

export default class LensProvider implements CodeLensProvider {
    provideCodeLenses(document: TextDocument) {
        const btns = util.btns;
        const links: any = [];

        const text = document.getText();
        const matches = text.matchAll(re);

        for (const match of matches) {
            const cmnd = match[0].replace(/^([ \t]+)?(\$)([ \t]+)?/gm, '');
            const pos = document.positionAt(match.index);
            const range = new Range(pos, pos.with(pos.line, pos.character + cmnd.length));
            const args = [{ text: cmnd }];

            links.push(
                new CodeLens(range, {
                    command: btns.run.cmnd,
                    title: btns.run.icon,
                    arguments: args,
                })
            );

            links.push(
                new CodeLens(range, {
                    command   : btns.copy.cmnd,
                    title     : btns.copy.icon,
                    arguments : args,
                })
            );
        }

        return links;
    }
}
