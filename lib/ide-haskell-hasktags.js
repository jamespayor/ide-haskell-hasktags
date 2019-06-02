"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const tags_1 = require("./tags");
const tags_list_view_1 = require("./tags-list-view");
var config_1 = require("./config");
exports.config = config_1.config;
let stack;
let disposables;
let active = false;
async function showList(editor, tags) {
    const tag = await tags_list_view_1.selectListView(tags, exports.tagsInstance.inProgress);
    if (tag !== undefined)
        open(editor, tag);
}
function open(editor, tag) {
    const edp = editor.getPath();
    if (edp) {
        stack.push({
            uri: edp,
            line: editor.getLastCursor().getBufferRow(),
            column: editor.getLastCursor().getBufferColumn(),
        });
    }
    void atom.workspace.open(tag.uri, {
        initialLine: tag.line,
        searchAllPanes: true,
    });
}
function activate() {
    active = true;
    stack = [];
    exports.tagsInstance = new tags_1.Tags();
    disposables = new atom_1.CompositeDisposable();
    disposables.add(atom.commands.add('atom-workspace', {
        'ide-haskell-hasktags:show-tags': () => {
            if (!active)
                return;
            const ed = atom.workspace.getActiveTextEditor();
            if (ed)
                void showList(ed, exports.tagsInstance.listTags());
        },
        'ide-haskell-hasktags:go-back': () => {
            const prevpos = stack.pop();
            if (prevpos) {
                void atom.workspace.open(prevpos.uri, {
                    initialLine: prevpos.line,
                    initialColumn: prevpos.column,
                    searchAllPanes: true,
                });
            }
        },
    }));
    disposables.add(atom.commands.add('atom-text-editor', {
        'ide-haskell-hasktags:show-file-tags': ({ currentTarget }) => {
            if (!active)
                return;
            const editor = currentTarget.getModel();
            const path = editor.getPath();
            if (!path)
                return;
            void showList(editor, exports.tagsInstance.listTags(path));
        },
        'ide-haskell-hasktags:go-to-declaration': ({ currentTarget, detail }) => {
            if (!active)
                return;
            const editor = currentTarget.getModel();
            const buffer = editor.getBuffer();
            const crange = editor.getLastSelection().getBufferRange();
            const { start, end } = buffer.rangeForRow(crange.start.row, false);
            const crange2 = { start: crange.start, end: crange.end };
            const left = buffer.getTextInRange([start, crange.start]);
            crange2.start.column = left.search(/[\w']*$/);
            const right = buffer.getTextInRange([crange.end, end]);
            crange2.end.column += right.search(/[^\w']|$/);
            const symbol = buffer.getTextInRange(crange2);
            const tags = exports.tagsInstance.findTag(symbol);
            switch (tags.length) {
                case 0:
                    return;
                case 1:
                    void open(editor, tags[0]);
                    break;
                default:
                    void showList(editor, tags);
            }
        },
    }));
    disposables.add(atom.contextMenu.add({
        'atom-text-editor[data-grammar~="haskell"]': [
            {
                label: 'Show File Tags',
                command: 'ide-haskell-hasktags:show-file-tags',
            },
        ],
    }));
    disposables.add(atom.contextMenu.add({
        'atom-text-editor[data-grammar~="haskell"]': [
            {
                label: 'Go to Declaration',
                command: 'ide-haskell-hasktags:go-to-declaration',
            },
        ],
    }));
    disposables.add(atom.menu.add([
        {
            label: 'Haskell IDE',
            submenu: [
                {
                    label: 'Hasktags',
                    submenu: [
                        {
                            label: 'Show Tags',
                            command: 'ide-haskell-hasktags:show-tags',
                        },
                        {
                            label: 'Show File Tags',
                            command: 'ide-haskell-hasktags:show-file-tags',
                        },
                    ],
                },
            ],
        },
    ]));
}
exports.activate = activate;
function deactivate() {
    disposables.dispose();
    exports.tagsInstance.destroy();
    active = false;
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlLWhhc2tlbGwtaGFza3RhZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWRlLWhhc2tlbGwtaGFza3RhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBc0Q7QUFDdEQsaUNBQTZCO0FBQzdCLHFEQUFpRDtBQUVqRCxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBR2YsSUFBSSxLQUlGLENBQUE7QUFDRixJQUFJLFdBQWdDLENBQUE7QUFDcEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFBO0FBRWxCLEtBQUssVUFBVSxRQUFRLENBQUMsTUFBa0IsRUFBRSxJQUFjO0lBQ3hELE1BQU0sR0FBRyxHQUFHLE1BQU0sK0JBQWMsQ0FBQyxJQUFJLEVBQUUsb0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMvRCxJQUFJLEdBQUcsS0FBSyxTQUFTO1FBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMxQyxDQUFDO0FBRUQsU0FBUyxJQUFJLENBQUMsTUFBa0IsRUFBRSxHQUFXO0lBRTNDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1QixJQUFJLEdBQUcsRUFBRTtRQUNQLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDVCxHQUFHLEVBQUUsR0FBRztZQUNSLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsWUFBWSxFQUFFO1lBQzNDLE1BQU0sRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsZUFBZSxFQUFFO1NBQ2pELENBQUMsQ0FBQTtLQUNIO0lBQ0QsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1FBQ2hDLFdBQVcsRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNyQixjQUFjLEVBQUUsSUFBSTtLQUNyQixDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsU0FBZ0IsUUFBUTtJQUN0QixN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LEVBQUUscUNBQXFDO3lCQUMvQztxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQ0gsQ0FBQTtBQUNILENBQUM7QUFyR0QsNEJBcUdDO0FBRUQsU0FBZ0IsVUFBVTtJQUN4QixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDckIsb0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN0QixNQUFNLEdBQUcsS0FBSyxDQUFBO0FBQ2hCLENBQUM7QUFKRCxnQ0FJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgVGFncyB9IGZyb20gJy4vdGFncydcbmltcG9ydCB7IHNlbGVjdExpc3RWaWV3IH0gZnJvbSAnLi90YWdzLWxpc3QtdmlldydcblxuZXhwb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnXG5cbmV4cG9ydCBsZXQgdGFnc0luc3RhbmNlOiBUYWdzXG5sZXQgc3RhY2s6IEFycmF5PHtcbiAgdXJpOiBzdHJpbmdcbiAgbGluZTogbnVtYmVyXG4gIGNvbHVtbjogbnVtYmVyXG59PlxubGV0IGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG5sZXQgYWN0aXZlID0gZmFsc2VcblxuYXN5bmMgZnVuY3Rpb24gc2hvd0xpc3QoZWRpdG9yOiBUZXh0RWRpdG9yLCB0YWdzOiBTeW1SZWNbXSkge1xuICBjb25zdCB0YWcgPSBhd2FpdCBzZWxlY3RMaXN0Vmlldyh0YWdzLCB0YWdzSW5zdGFuY2UuaW5Qcm9ncmVzcylcbiAgaWYgKHRhZyAhPT0gdW5kZWZpbmVkKSBvcGVuKGVkaXRvciwgdGFnKVxufVxuXG5mdW5jdGlvbiBvcGVuKGVkaXRvcjogVGV4dEVkaXRvciwgdGFnOiBTeW1SZWMpIHtcbiAgLy8gZWRpdG9yID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICBjb25zdCBlZHAgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gIGlmIChlZHApIHtcbiAgICBzdGFjay5wdXNoKHtcbiAgICAgIHVyaTogZWRwLFxuICAgICAgbGluZTogZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJSb3coKSxcbiAgICAgIGNvbHVtbjogZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJDb2x1bW4oKSxcbiAgICB9KVxuICB9XG4gIHZvaWQgYXRvbS53b3Jrc3BhY2Uub3Blbih0YWcudXJpLCB7XG4gICAgaW5pdGlhbExpbmU6IHRhZy5saW5lLFxuICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGFjdGl2ZSA9IHRydWVcbiAgc3RhY2sgPSBbXVxuICB0YWdzSW5zdGFuY2UgPSBuZXcgVGFncygpXG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOnNob3ctdGFncyc6ICgpID0+IHtcbiAgICAgICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgICAgICBjb25zdCBlZCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBpZiAoZWQpIHZvaWQgc2hvd0xpc3QoZWQsIHRhZ3NJbnN0YW5jZS5saXN0VGFncygpKVxuICAgICAgfSxcbiAgICAgICdpZGUtaGFza2VsbC1oYXNrdGFnczpnby1iYWNrJzogKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2cG9zID0gc3RhY2sucG9wKClcbiAgICAgICAgaWYgKHByZXZwb3MpIHtcbiAgICAgICAgICB2b2lkIGF0b20ud29ya3NwYWNlLm9wZW4ocHJldnBvcy51cmksIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBwcmV2cG9zLmxpbmUsXG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBwcmV2cG9zLmNvbHVtbixcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gIClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOnNob3ctZmlsZS10YWdzJzogKHsgY3VycmVudFRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICAgICAgY29uc3QgZWRpdG9yOiBUZXh0RWRpdG9yID0gKGN1cnJlbnRUYXJnZXQgYXMgYW55KS5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGlmICghcGF0aCkgcmV0dXJuXG4gICAgICAgIHZvaWQgc2hvd0xpc3QoZWRpdG9yLCB0YWdzSW5zdGFuY2UubGlzdFRhZ3MocGF0aCkpXG4gICAgICB9LFxuICAgICAgJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOmdvLXRvLWRlY2xhcmF0aW9uJzogKHsgY3VycmVudFRhcmdldCwgZGV0YWlsIH0pID0+IHtcbiAgICAgICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgICAgICBjb25zdCBlZGl0b3I6IFRleHRFZGl0b3IgPSAoY3VycmVudFRhcmdldCBhcyBhbnkpLmdldE1vZGVsKClcbiAgICAgICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgIGNvbnN0IGNyYW5nZSA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGJ1ZmZlci5yYW5nZUZvclJvdyhjcmFuZ2Uuc3RhcnQucm93LCBmYWxzZSlcbiAgICAgICAgY29uc3QgY3JhbmdlMiA9IHsgc3RhcnQ6IGNyYW5nZS5zdGFydCwgZW5kOiBjcmFuZ2UuZW5kIH1cbiAgICAgICAgY29uc3QgbGVmdCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbc3RhcnQsIGNyYW5nZS5zdGFydF0pXG4gICAgICAgIGNyYW5nZTIuc3RhcnQuY29sdW1uID0gbGVmdC5zZWFyY2goL1tcXHcnXSokLylcbiAgICAgICAgY29uc3QgcmlnaHQgPSBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoW2NyYW5nZS5lbmQsIGVuZF0pXG4gICAgICAgIGNyYW5nZTIuZW5kLmNvbHVtbiArPSByaWdodC5zZWFyY2goL1teXFx3J118JC8pXG4gICAgICAgIGNvbnN0IHN5bWJvbCA9IGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShjcmFuZ2UyKVxuICAgICAgICBjb25zdCB0YWdzID0gdGFnc0luc3RhbmNlLmZpbmRUYWcoc3ltYm9sKVxuICAgICAgICBzd2l0Y2ggKHRhZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdm9pZCBvcGVuKGVkaXRvciwgdGFnc1swXSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZvaWQgc2hvd0xpc3QoZWRpdG9yLCB0YWdzKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICApXG5cbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49XCJoYXNrZWxsXCJdJzogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdTaG93IEZpbGUgVGFncycsXG4gICAgICAgICAgY29tbWFuZDogJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOnNob3ctZmlsZS10YWdzJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gIClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49XCJoYXNrZWxsXCJdJzogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdHbyB0byBEZWNsYXJhdGlvbicsXG4gICAgICAgICAgY29tbWFuZDogJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOmdvLXRvLWRlY2xhcmF0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG4gIClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20ubWVudS5hZGQoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0hhc2tlbGwgSURFJyxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnSGFza3RhZ3MnLFxuICAgICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTaG93IFRhZ3MnLFxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6ICdpZGUtaGFza2VsbC1oYXNrdGFnczpzaG93LXRhZ3MnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdTaG93IEZpbGUgVGFncycsXG4gICAgICAgICAgICAgICAgY29tbWFuZDogJ2lkZS1oYXNrZWxsLWhhc2t0YWdzOnNob3ctZmlsZS10YWdzJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgXSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICB0YWdzSW5zdGFuY2UuZGVzdHJveSgpXG4gIGFjdGl2ZSA9IGZhbHNlXG59XG4iXX0=