import FileTreeAlternativePlugin from 'main';
import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import { TFile, TFolder, App, MarkdownView } from 'obsidian';
import { eventTypes, OZFile } from 'utils/types';

export const openFile = (props: { file: OZFile; app: App; newLeaf: boolean; leafBySplit?: boolean }) => {
    const { file, app, newLeaf, leafBySplit } = props;
    let fileToOpen = app.vault.getAbstractFileByPath(file.path);
    if (!fileToOpen) return;
    let leaf = app.workspace.getLeaf(newLeaf);
    if (leafBySplit) leaf = app.workspace.createLeafBySplit(leaf, 'vertical');
    app.workspace.setActiveLeaf(leaf, {
        focus: true,
    });
    leaf.openFile(fileToOpen as TFile, { eState: { focus: true } });
};

export const openFileWithSelection = async (params: {
    app: App;
    file: OZFile;
    inNewLeaf?: boolean;
    lineNumber: number;
    matchStartIndex?: number;
    matchEndIndex?: number;
    highlightDurationMs?: number;
}) => {
    const { app, file, inNewLeaf, lineNumber, matchStartIndex, matchEndIndex, highlightDurationMs } = params;
    let leaf = app.workspace.getMostRecentLeaf();
    if (!leaf) return;
    if (inNewLeaf || leaf.getViewState().pinned) {
        leaf = app.workspace.getLeaf('tab');
    }
    const tf = app.vault.getAbstractFileByPath(file.path) as TFile;
    if (!tf) return;
    await leaf.openFile(tf);
    const v = app.workspace.getActiveViewOfType(MarkdownView) || (leaf.view instanceof MarkdownView ? (leaf.view as MarkdownView) : null);
    const editor = v && (v as any).editor ? (v as any).editor : undefined;
    if (!editor) return;
    const targetLine = Math.max(0, (lineNumber || 1) - 1);
    if (typeof matchStartIndex === 'number' && typeof matchEndIndex === 'number' && matchStartIndex >= 0 && matchEndIndex >= matchStartIndex) {
        editor.focus();
        editor.setSelection({ line: targetLine, ch: matchStartIndex }, { line: targetLine, ch: matchEndIndex + 1 });
        setTimeout(() => {
            editor.setCursor({ line: targetLine, ch: matchEndIndex + 1 });
            if (highlightDurationMs && highlightDurationMs > 0) {
                setTimeout(() => {
                    editor.setCursor({ line: targetLine, ch: matchEndIndex + 1 });
                }, highlightDurationMs);
            }
        }, 50);
        const maybeScroll = (editor as unknown as { scrollIntoView?: (range: { from: { line: number; ch: number }; to: { line: number; ch: number } }, center?: boolean) => void });
        if (typeof maybeScroll.scrollIntoView === 'function') {
            maybeScroll.scrollIntoView({ from: { line: targetLine, ch: 0 }, to: { line: targetLine, ch: 0 } }, true);
        }
    } else {
        editor.focus();
        editor.setCursor({ line: targetLine, ch: 0 });
        const maybeScroll = (editor as unknown as { scrollIntoView?: (range: { from: { line: number; ch: number }; to: { line: number; ch: number } }, center?: boolean) => void });
        if (typeof maybeScroll.scrollIntoView === 'function') {
            maybeScroll.scrollIntoView({ from: { line: targetLine, ch: 0 }, to: { line: targetLine, ch: 0 } }, true);
        }
    }
};

export const getFileCreateString = (params: { plugin: FileTreeAlternativePlugin; fileName: string }): string => {
    const { plugin, fileName } = params;

    return stripIndents`
    ${
        plugin.settings.createdYaml
            ? `
        ---
        created: ${dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss')}
        ---
        `
            : ''
    }
    ${plugin.settings.fileNameIsHeader ? `# ${fileName}` : ''}
    `;
};

export const createNewMarkdownFile = async (plugin: FileTreeAlternativePlugin, folder: TFolder, newFileName: string, content?: string) => {
    // @ts-ignore
    const newFile = await plugin.app.fileManager.createNewMarkdownFile(folder, newFileName);
    if (content && content !== '') await plugin.app.vault.modify(newFile, content);
    openFile({ file: newFile, app: plugin.app, newLeaf: false });
    let evt = new CustomEvent(eventTypes.activeFileChange, { detail: { filePath: newFile.path } });
    window.dispatchEvent(evt);
};

export const openFileInNewTab = (app: App, file: OZFile) => {
    openFile({ file: file, app: app, newLeaf: true });
};

export const openFileInNewTabGroup = (app: App, file: OZFile) => {
    openFile({ file: file, app: app, newLeaf: false, leafBySplit: true });
};
