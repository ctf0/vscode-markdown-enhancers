import * as vscode from 'vscode'
import { titleCase } from "title-case";

export let config: any
export let MASK_EXTENSION_PROVIDER
export const PACKAGE_NAME: string = 'markdownEnhancers'
export const FILE_TYPE = 'markdown'
export const CMND_PREFIX = 'markdown'
export const btns = {
    run: {
        icon: '$(play) Run',
        cmnd: `${CMND_PREFIX}.run`
    },
    copy: {
        icon: '$(clippy) Copy',
        cmnd: `${CMND_PREFIX}.copy`
    }
}

export function getTerminalWindow() {
    let termnl_window = `${pkgTitle()}: Run`
    let trmnls = vscode.window.terminals
    let terminal

    for (let index = 0; index < trmnls.length; index++) {
        const trmnl = trmnls[index]

        if (trmnl.name == termnl_window) {
            terminal = trmnl
            break
        }
    }

    return terminal || vscode.window.createTerminal(termnl_window)
}

export function prepareArgs(args: object){
    return encodeURIComponent(JSON.stringify([args]));
}

export function pkgTitle(){
    return titleCase(PACKAGE_NAME);
}

export async function maskExtensionProviderInit() {
    const maskExtension = vscode.extensions.getExtension("ctf0.symbol-masks-new");

    if (maskExtension == null) {
        throw new Error("Depends on 'ctf0.symbol-masks-new' extension");
    }

    MASK_EXTENSION_PROVIDER = await maskExtension.activate();
}

export function setConfig() {
    config = vscode.workspace.getConfiguration(PACKAGE_NAME);
}
