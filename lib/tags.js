"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const os_1 = require("os");
const path_1 = require("path");
const child_process_1 = require("child_process");
class Tags {
    constructor() {
        this.inProgress = false;
        this.disposables = new atom_1.CompositeDisposable();
        this.tags = new Map();
        this.paths = atom.project.getPaths();
        this.filesChanged = (evts) => {
            for (const evt of evts) {
                if (!evt.path.endsWith('.hs') && !evt.path.endsWith('.lhs'))
                    continue;
                switch (evt.action) {
                    case 'created':
                        this.update(evt.path);
                        break;
                    case 'modified':
                        this.update(evt.path);
                        break;
                    case 'deleted':
                        this.tags.delete(evt.path);
                        break;
                    case 'renamed':
                        this.tags.delete(evt.oldPath);
                        this.update(evt.path);
                        break;
                }
            }
        };
        this.pathsChanged = (paths) => {
            const removedPaths = this.paths.filter((p) => !paths.includes(p));
            const addedPaths = paths.filter((p) => !this.paths.includes(p));
            if (removedPaths.length > 0) {
                Array.from(this.tags.keys())
                    .filter((f) => removedPaths.some((p) => f.startsWith(p + path_1.sep)))
                    .forEach((k) => this.tags.delete(k));
            }
            for (const path of addedPaths) {
                this.update(path);
            }
            this.paths = paths;
        };
        this.disposables.add(atom.project.onDidChangeFiles(this.filesChanged));
        this.disposables.add(atom.project.onDidChangePaths(this.pathsChanged));
        for (const path of this.paths) {
            this.update(path);
        }
    }
    destroy() {
        this.disposables.dispose();
        this.tags.clear();
    }
    update(path) {
        this.inProgress = true;
        let fn = false;
        let curfile = new Map();
        let cmd = atom.config.get('ide-haskell-hasktags.hasktagsPath');
        const env = Object.create(process.env);
        const args = [];
        if (cmd === 'hasktags.js') {
            env.ELECTRON_RUN_AS_NODE = 1;
            env.ELECTRON_NO_ATTACH_CONSOLE = 1;
            cmd = process.execPath;
            args.push('--no-deprecation');
            args.push(require.resolve('@atom-haskell/hasktags-js'));
        }
        args.push('-eRo-');
        if (atom.config.get('ide-haskell-hasktags.ignoreCloseImplementation')) {
            args.push('--ignore-close-implementation');
        }
        args.push(path.replace(/\\/g, "/"));
        const callback = (error, data, stderr) => {
            try {
                if (error) {
                    switch (stderr) {
                        case '<stdout>: hFlush: illegal operation (handle is closed)':
                            break;
                        default:
                            console.warn('hasktags stderr', stderr);
                            atom.notifications.addError('Failed to run hasktags', {
                                detail: error.message,
                                stack: error.stack,
                                dismissable: true,
                            });
                            return;
                    }
                }
                const lines = data.split(os_1.EOL);
                for (const line of lines.slice(0, -1)) {
                    switch (true) {
                        case line === '\x0c':
                            fn = true;
                            break;
                        case fn:
                            fn = false;
                            const res = /^(.*),\d+$/.exec(line);
                            if (res === null)
                                continue;
                            const [, src] = res;
                            curfile = new Map();
                            this.tags.set(src, curfile);
                            break;
                        default:
                            const rxr = /^(.*)\x7f(.*)\x01(\d+),(\d+)$/.exec(line);
                            if (rxr === null)
                                continue;
                            const [, context, tagName, lineNo] = rxr;
                            let obj = curfile.get(tagName);
                            if (obj === undefined) {
                                obj = [];
                                curfile.set(tagName, obj);
                            }
                            obj.push({ context, line: parseInt(lineNo, 10) });
                    }
                }
            }
            finally {
                this.inProgress = false;
            }
        };
        if (process.platform === 'win32') {
            child_process_1.exec('chcp 65001 && "' + cmd + '"' + (args ? ' "' + args.join('" "') + '"' : ''), { env, encoding: 'utf8', maxBuffer: Infinity }, callback);
        }
        else {
            child_process_1.execFile(cmd, args, { env, encoding: 'utf8', maxBuffer: Infinity }, callback);
        }
    }
    listTags(uri) {
        const res = [];
        if (!uri) {
            this.tags.forEach((tagMap, uri) => tagMap.forEach((lines, tag) => lines.forEach(({ context, line }) => res.push({ tag, uri, context, line }))));
        }
        else {
            const tagMap = this.tags.get(uri);
            if (tagMap !== undefined) {
                tagMap.forEach((lines, tag) => lines.forEach(({ context, line }) => res.push({ tag, uri, context, line })));
            }
        }
        return res;
    }
    findTag(tag) {
        const res = [];
        this.tags.forEach((tagMap, uri) => {
            const lines = tagMap.get(tag);
            if (lines === undefined)
                return;
            lines.forEach(({ context, line }) => {
                res.push({ tag, uri, context, line });
            });
        });
        return res;
    }
}
exports.Tags = Tags;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQWlFO0FBQ2pFLDJCQUF3QjtBQUN4QiwrQkFBMEI7QUFDMUIsaURBQThDO0FBVTlDLE1BQWEsSUFBSTtJQUtmO1FBSk8sZUFBVSxHQUFZLEtBQUssQ0FBQTtRQUMxQixnQkFBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUN2QyxTQUFJLEdBQVEsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNyQixVQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQTRIL0IsaUJBQVksR0FBRyxDQUFDLElBQTJCLEVBQUUsRUFBRTtZQUNyRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUFFLFNBQVE7Z0JBQ3JFLFFBQVEsR0FBRyxDQUFDLE1BQU0sRUFBRTtvQkFDbEIsS0FBSyxTQUFTO3dCQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNyQixNQUFLO29CQUNQLEtBQUssVUFBVTt3QkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDckIsTUFBSztvQkFDUCxLQUFLLFNBQVM7d0JBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUMxQixNQUFLO29CQUNQLEtBQUssU0FBUzt3QkFFWixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBUSxDQUFDLENBQUE7d0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMs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O1FBQ0QsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDO0lBRU0sT0FBTyxDQUFDLEdBQVc7UUFDeEIsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDN0IsSUFBSSxLQUFLLEtBQUssU0FBUztnQkFBRSxPQUFNO1lBQy9CLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO2dCQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUN2QyxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDO0NBcUNGO0FBbktELG9CQW1LQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEZpbGVzeXN0ZW1DaGFuZ2VFdmVudCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBFT0wgfSBmcm9tICdvcydcbmltcG9ydCB7IHNlcCB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBleGVjLCBleGVjRmlsZSB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmludGVyZmFjZSBMaW5lUmVjIHtcbiAgY29udGV4dDogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxufVxuXG50eXBlIEZpbGVSZWMgPSBNYXA8c3RyaW5nLCBMaW5lUmVjW10+XG50eXBlIFJlYyA9IE1hcDxzdHJpbmcsIEZpbGVSZWM+XG5cbmV4cG9ydCBjbGFzcyBUYWdzIHtcbiAgcHVibGljIGluUHJvZ3Jlc3M6IGJvb2xlYW4gPSBmYWxzZVxuICBwcml2YXRlIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcml2YXRlIHRhZ3M6IFJlYyA9IG5ldyBNYXAoKVxuICBwcml2YXRlIHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlRmlsZXModGhpcy5maWxlc0NoYW5nZWQpKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMucGF0aHNDaGFuZ2VkKSlcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgdGhpcy51cGRhdGUocGF0aClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMudGFncy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuaW5Qcm9ncmVzcyA9IHRydWVcbiAgICBsZXQgZm46IGJvb2xlYW4gPSBmYWxzZVxuICAgIGxldCBjdXJmaWxlOiBNYXA8c3RyaW5nLCBMaW5lUmVjW10+ID0gbmV3IE1hcCgpXG4gICAgbGV0IGNtZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICAgJ2lkZS1oYXNrZWxsLWhhc2t0YWdzLmhhc2t0YWdzUGF0aCcsXG4gICAgKVxuICAgIGNvbnN0IGVudiA9IE9iamVjdC5jcmVhdGUocHJvY2Vzcy5lbnYpXG4gICAgY29uc3QgYXJncyA9IFtdXG4gICAgaWYgKGNtZCA9PT0gJ2hhc2t0YWdzLmpzJykge1xuICAgICAgZW52LkVMRUNUUk9OX1JVTl9BU19OT0RFID0gMVxuICAgICAgZW52LkVMRUNUUk9OX05PX0FUVEFDSF9DT05TT0xFID0gMVxuICAgICAgY21kID0gcHJvY2Vzcy5leGVjUGF0aFxuICAgICAgYXJncy5wdXNoKCctLW5vLWRlcHJlY2F0aW9uJylcbiAgICAgIGFyZ3MucHVzaChyZXF1aXJlLnJlc29sdmUoJ0BhdG9tLWhhc2tlbGwvaGFza3RhZ3MtanMnKSlcbiAgICB9XG4gICAgYXJncy5wdXNoKCctZVJvLScpXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnaWRlLWhhc2tlbGwtaGFza3RhZ3MuaWdub3JlQ2xvc2VJbXBsZW1lbnRhdGlvbicpKSB7XG4gICAgICBhcmdzLnB1c2goJy0taWdub3JlLWNsb3NlLWltcGxlbWVudGF0aW9uJylcbiAgICB9XG4gICAgYXJncy5wdXNoKHBhdGgucmVwbGFjZSgvXFxcXC9nLCBcIi9cIikpIC8vIFRoaXMgZmluZC1yZXBsYWNlIGVuc3VyZXMgbm8gc2hlbmFuaWdhbnMgb24gV2luZG93cywgYmVjYXVzZSB3ZSBoYXZlIHRvIGRvIHNvbWUgaGFja3kgc3R1ZmYgYmVsb3cgPShcbiAgICBjb25zdCBjYWxsYmFjayA9IChlcnJvciwgZGF0YSwgc3RkZXJyKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBzd2l0Y2ggKHN0ZGVycikge1xuICAgICAgICAgICAgY2FzZSAnPHN0ZG91dD46IGhGbHVzaDogaWxsZWdhbCBvcGVyYXRpb24gKGhhbmRsZSBpcyBjbG9zZWQpJzpcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybignaGFza3RhZ3Mgc3RkZXJyJywgc3RkZXJyKVxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBydW4gaGFza3RhZ3MnLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxpbmVzID0gZGF0YS5zcGxpdChFT0wpXG4gICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcy5zbGljZSgwLCAtMSkpIHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgbGluZSA9PT0gJ1xceDBjJzpcbiAgICAgICAgICAgICAgZm4gPSB0cnVlXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlIGZuOlxuICAgICAgICAgICAgICBmbiA9IGZhbHNlXG4gICAgICAgICAgICAgIGNvbnN0IHJlcyA9IC9eKC4qKSxcXGQrJC8uZXhlYyhsaW5lKVxuICAgICAgICAgICAgICBpZiAocmVzID09PSBudWxsKSBjb250aW51ZVxuICAgICAgICAgICAgICBjb25zdCBbLCBzcmNdID0gcmVzXG4gICAgICAgICAgICAgIGN1cmZpbGUgPSBuZXcgTWFwKClcbiAgICAgICAgICAgICAgdGhpcy50YWdzLnNldChzcmMsIGN1cmZpbGUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBjb25zdCByeHIgPSAvXiguKilcXHg3ZiguKilcXHgwMShcXGQrKSwoXFxkKykkLy5leGVjKGxpbmUpXG4gICAgICAgICAgICAgIGlmIChyeHIgPT09IG51bGwpIGNvbnRpbnVlXG4gICAgICAgICAgICAgIGNvbnN0IFssIGNvbnRleHQsIHRhZ05hbWUsIGxpbmVOb10gPSByeHJcbiAgICAgICAgICAgICAgbGV0IG9iaiA9IGN1cmZpbGUuZ2V0KHRhZ05hbWUpXG4gICAgICAgICAgICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9iaiA9IFtdXG4gICAgICAgICAgICAgICAgY3VyZmlsZS5zZXQodGFnTmFtZSwgb2JqKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9iai5wdXNoKHsgY29udGV4dCwgbGluZTogcGFyc2VJbnQobGluZU5vLCAxMCkgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaW5Qcm9ncmVzcyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAvLyBXZSBoYXZlIHRvIGhhY2tpbHkgY2F1c2UgV2luZG93cyB0byBzdXBwb3J0IFVURi04IGJ5IGNoYW5naW5nIHRoZSBhY3RpdmUgXCJjb2RlIHBhZ2VcIiB3aXRoIGNoY3AgPShcbiAgICAgIGV4ZWMoJ2NoY3AgNjUwMDEgJiYgXCInICsgY21kICsgJ1wiJyArIChhcmdzID8gJyBcIicgKyBhcmdzLmpvaW4oJ1wiIFwiJykgKyAnXCInIDogJycpLCB7IGVudiwgZW5jb2Rpbmc6ICd1dGY4JywgbWF4QnVmZmVyOiBJbmZpbml0eSB9LCBjYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgZXhlY0ZpbGUoY21kLCBhcmdzLCB7IGVudiwgZW5jb2Rpbmc6ICd1dGY4JywgbWF4QnVmZmVyOiBJbmZpbml0eSB9LCBjYWxsYmFjaylcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbGlzdFRhZ3ModXJpPzogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzOiBTeW1SZWNbXSA9IFtdXG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHRoaXMudGFncy5mb3JFYWNoKCh0YWdNYXAsIHVyaSkgPT5cbiAgICAgICAgdGFnTWFwLmZvckVhY2goKGxpbmVzLCB0YWcpID0+XG4gICAgICAgICAgbGluZXMuZm9yRWFjaCgoeyBjb250ZXh0LCBsaW5lIH0pID0+XG4gICAgICAgICAgICByZXMucHVzaCh7IHRhZywgdXJpLCBjb250ZXh0LCBsaW5lIH0pLFxuICAgICAgICAgICksXG4gICAgICAgICksXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRhZ01hcCA9IHRoaXMudGFncy5nZXQodXJpKVxuICAgICAgaWYgKHRhZ01hcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhZ01hcC5mb3JFYWNoKChsaW5lcywgdGFnKSA9PlxuICAgICAgICAgIGxpbmVzLmZvckVhY2goKHsgY29udGV4dCwgbGluZSB9KSA9PlxuICAgICAgICAgICAgcmVzLnB1c2goeyB0YWcsIHVyaSwgY29udGV4dCwgbGluZSB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHB1YmxpYyBmaW5kVGFnKHRhZzogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzOiBTeW1SZWNbXSA9IFtdXG4gICAgdGhpcy50YWdzLmZvckVhY2goKHRhZ01hcCwgdXJpKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IHRhZ01hcC5nZXQodGFnKVxuICAgICAgaWYgKGxpbmVzID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgbGluZXMuZm9yRWFjaCgoeyBjb250ZXh0LCBsaW5lIH0pID0+IHtcbiAgICAgICAgcmVzLnB1c2goeyB0YWcsIHVyaSwgY29udGV4dCwgbGluZSB9KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHByaXZhdGUgZmlsZXNDaGFuZ2VkID0gKGV2dHM6IEZpbGVzeXN0ZW1DaGFuZ2VFdmVudCkgPT4ge1xuICAgIGZvciAoY29uc3QgZXZ0IG9mIGV2dHMpIHtcbiAgICAgIGlmICghZXZ0LnBhdGguZW5kc1dpdGgoJy5ocycpICYmICFldnQucGF0aC5lbmRzV2l0aCgnLmxocycpKSBjb250aW51ZVxuICAgICAgc3dpdGNoIChldnQuYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2NyZWF0ZWQnOlxuICAgICAgICAgIHRoaXMudXBkYXRlKGV2dC5wYXRoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ21vZGlmaWVkJzpcbiAgICAgICAgICB0aGlzLnVwZGF0ZShldnQucGF0aClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdkZWxldGVkJzpcbiAgICAgICAgICB0aGlzLnRhZ3MuZGVsZXRlKGV2dC5wYXRoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3JlbmFtZWQnOlxuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgdGhpcy50YWdzLmRlbGV0ZShldnQub2xkUGF0aCEpXG4gICAgICAgICAgdGhpcy51cGRhdGUoZXZ0LnBhdGgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhdGhzQ2hhbmdlZCA9IChwYXRoczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCByZW1vdmVkUGF0aHMgPSB0aGlzLnBhdGhzLmZpbHRlcigocCkgPT4gIXBhdGhzLmluY2x1ZGVzKHApKVxuICAgIGNvbnN0IGFkZGVkUGF0aHMgPSBwYXRocy5maWx0ZXIoKHApID0+ICF0aGlzLnBhdGhzLmluY2x1ZGVzKHApKVxuICAgIGlmIChyZW1vdmVkUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgQXJyYXkuZnJvbSh0aGlzLnRhZ3Mua2V5cygpKVxuICAgICAgICAuZmlsdGVyKChmKSA9PiByZW1vdmVkUGF0aHMuc29tZSgocCkgPT4gZi5zdGFydHNXaXRoKHAgKyBzZXApKSlcbiAgICAgICAgLmZvckVhY2goKGspID0+IHRoaXMudGFncy5kZWxldGUoaykpXG4gICAgfVxuICAgIGZvciAoY29uc3QgcGF0aCBvZiBhZGRlZFBhdGhzKSB7XG4gICAgICB0aGlzLnVwZGF0ZShwYXRoKVxuICAgIH1cbiAgICB0aGlzLnBhdGhzID0gcGF0aHNcbiAgfVxufVxuIl19