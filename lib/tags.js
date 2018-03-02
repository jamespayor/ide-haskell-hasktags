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
        args.push(path);
        child_process_1.execFile(cmd, args, { env, encoding: 'utf8' }, (error, data, stderr) => {
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
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQWlFO0FBQ2pFLDJCQUF3QjtBQUN4QiwrQkFBMEI7QUFDMUIsaURBQXdDO0FBVXhDO0lBS0U7UUFKTyxlQUFVLEdBQVksS0FBSyxDQUFBO1FBQzFCLGdCQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLFNBQUksR0FBUSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ3JCLFVBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBc0gvQixpQkFBWSxHQUFHLENBQUMsSUFBMkIsRUFBRSxFQUFFO1lBQ3JELEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFBQyxRQUFRLENBQUE7Z0JBQ3JFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNuQixLQUFLLFNBQVM7d0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQ3JCLEtBQUssQ0FBQTtvQkFDUCxLQUFLLFVBQVU7d0JBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQ3JCLEtBQUssQ0FBQTtvQkFDUCxLQUFLLFNBQVM7d0JBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUMxQixLQUFLLENBQUE7b0JBQ1AsS0FBSyxTQUFTO3dCQUVaLElBQUksQ0FBQyxJQUFJLENB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bEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQ3RDLENBQ0YsQ0FBQTtZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQTtJQUNaLENBQUM7SUFFTSxPQUFPLENBQUMsR0FBVztRQUN4QixNQUFNLEdBQUcsR0FBYSxFQUFFLENBQUE7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUM3QixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDO2dCQUFDLE1BQU0sQ0FBQTtZQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtnQkFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7WUFDdkMsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtRQUNGLE1BQU0sQ0FBQyxHQUFHLENBQUE7SUFDWixDQUFDO0NBcUNGO0FBN0pELG9CQTZKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEZpbGVzeXN0ZW1DaGFuZ2VFdmVudCB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBFT0wgfSBmcm9tICdvcydcbmltcG9ydCB7IHNlcCB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBleGVjRmlsZSB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5cbmludGVyZmFjZSBMaW5lUmVjIHtcbiAgY29udGV4dDogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxufVxuXG50eXBlIEZpbGVSZWMgPSBNYXA8c3RyaW5nLCBMaW5lUmVjW10+XG50eXBlIFJlYyA9IE1hcDxzdHJpbmcsIEZpbGVSZWM+XG5cbmV4cG9ydCBjbGFzcyBUYWdzIHtcbiAgcHVibGljIGluUHJvZ3Jlc3M6IGJvb2xlYW4gPSBmYWxzZVxuICBwcml2YXRlIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcml2YXRlIHRhZ3M6IFJlYyA9IG5ldyBNYXAoKVxuICBwcml2YXRlIHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlRmlsZXModGhpcy5maWxlc0NoYW5nZWQpKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMucGF0aHNDaGFuZ2VkKSlcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wYXRocykge1xuICAgICAgdGhpcy51cGRhdGUocGF0aClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMudGFncy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuaW5Qcm9ncmVzcyA9IHRydWVcbiAgICBsZXQgZm46IGJvb2xlYW4gPSBmYWxzZVxuICAgIGxldCBjdXJmaWxlOiBNYXA8c3RyaW5nLCBMaW5lUmVjW10+ID0gbmV3IE1hcCgpXG4gICAgbGV0IGNtZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICAgJ2lkZS1oYXNrZWxsLWhhc2t0YWdzLmhhc2t0YWdzUGF0aCcsXG4gICAgKVxuICAgIGNvbnN0IGVudiA9IE9iamVjdC5jcmVhdGUocHJvY2Vzcy5lbnYpXG4gICAgY29uc3QgYXJncyA9IFtdXG4gICAgaWYgKGNtZCA9PT0gJ2hhc2t0YWdzLmpzJykge1xuICAgICAgZW52LkVMRUNUUk9OX1JVTl9BU19OT0RFID0gMVxuICAgICAgZW52LkVMRUNUUk9OX05PX0FUVEFDSF9DT05TT0xFID0gMVxuICAgICAgY21kID0gcHJvY2Vzcy5leGVjUGF0aFxuICAgICAgYXJncy5wdXNoKCctLW5vLWRlcHJlY2F0aW9uJylcbiAgICAgIGFyZ3MucHVzaChyZXF1aXJlLnJlc29sdmUoJ0BhdG9tLWhhc2tlbGwvaGFza3RhZ3MtanMnKSlcbiAgICB9XG4gICAgYXJncy5wdXNoKCctZVJvLScpXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnaWRlLWhhc2tlbGwtaGFza3RhZ3MuaWdub3JlQ2xvc2VJbXBsZW1lbnRhdGlvbicpKSB7XG4gICAgICBhcmdzLnB1c2goJy0taWdub3JlLWNsb3NlLWltcGxlbWVudGF0aW9uJylcbiAgICB9XG4gICAgYXJncy5wdXNoKHBhdGgpXG4gICAgZXhlY0ZpbGUoY21kLCBhcmdzLCB7IGVudiwgZW5jb2Rpbmc6ICd1dGY4JyB9LCAoZXJyb3IsIGRhdGEsIHN0ZGVycikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgc3dpdGNoIChzdGRlcnIpIHtcbiAgICAgICAgICAgIGNhc2UgJzxzdGRvdXQ+OiBoRmx1c2g6IGlsbGVnYWwgb3BlcmF0aW9uIChoYW5kbGUgaXMgY2xvc2VkKSc6XG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2hhc2t0YWdzIHN0ZGVycicsIHN0ZGVycilcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gcnVuIGhhc2t0YWdzJywge1xuICAgICAgICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsaW5lcyA9IGRhdGEuc3BsaXQoRU9MKVxuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMuc2xpY2UoMCwgLTEpKSB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGxpbmUgPT09ICdcXHgwYyc6XG4gICAgICAgICAgICAgIGZuID0gdHJ1ZVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSBmbjpcbiAgICAgICAgICAgICAgZm4gPSBmYWxzZVxuICAgICAgICAgICAgICBjb25zdCByZXMgPSAvXiguKiksXFxkKyQvLmV4ZWMobGluZSlcbiAgICAgICAgICAgICAgaWYgKHJlcyA9PT0gbnVsbCkgY29udGludWVcbiAgICAgICAgICAgICAgY29uc3QgWywgc3JjXSA9IHJlc1xuICAgICAgICAgICAgICBjdXJmaWxlID0gbmV3IE1hcCgpXG4gICAgICAgICAgICAgIHRoaXMudGFncy5zZXQoc3JjLCBjdXJmaWxlKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgY29uc3QgcnhyID0gL14oLiopXFx4N2YoLiopXFx4MDEoXFxkKyksKFxcZCspJC8uZXhlYyhsaW5lKVxuICAgICAgICAgICAgICBpZiAocnhyID09PSBudWxsKSBjb250aW51ZVxuICAgICAgICAgICAgICBjb25zdCBbLCBjb250ZXh0LCB0YWdOYW1lLCBsaW5lTm9dID0gcnhyXG4gICAgICAgICAgICAgIGxldCBvYmogPSBjdXJmaWxlLmdldCh0YWdOYW1lKVxuICAgICAgICAgICAgICBpZiAob2JqID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvYmogPSBbXVxuICAgICAgICAgICAgICAgIGN1cmZpbGUuc2V0KHRhZ05hbWUsIG9iailcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBvYmoucHVzaCh7IGNvbnRleHQsIGxpbmU6IHBhcnNlSW50KGxpbmVObywgMTApIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLmluUHJvZ3Jlc3MgPSBmYWxzZVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgbGlzdFRhZ3ModXJpPzogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzOiBTeW1SZWNbXSA9IFtdXG4gICAgaWYgKCF1cmkpIHtcbiAgICAgIHRoaXMudGFncy5mb3JFYWNoKCh0YWdNYXAsIHVyaSkgPT5cbiAgICAgICAgdGFnTWFwLmZvckVhY2goKGxpbmVzLCB0YWcpID0+XG4gICAgICAgICAgbGluZXMuZm9yRWFjaCgoeyBjb250ZXh0LCBsaW5lIH0pID0+XG4gICAgICAgICAgICByZXMucHVzaCh7IHRhZywgdXJpLCBjb250ZXh0LCBsaW5lIH0pLFxuICAgICAgICAgICksXG4gICAgICAgICksXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRhZ01hcCA9IHRoaXMudGFncy5nZXQodXJpKVxuICAgICAgaWYgKHRhZ01hcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhZ01hcC5mb3JFYWNoKChsaW5lcywgdGFnKSA9PlxuICAgICAgICAgIGxpbmVzLmZvckVhY2goKHsgY29udGV4dCwgbGluZSB9KSA9PlxuICAgICAgICAgICAgcmVzLnB1c2goeyB0YWcsIHVyaSwgY29udGV4dCwgbGluZSB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHB1YmxpYyBmaW5kVGFnKHRhZzogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzOiBTeW1SZWNbXSA9IFtdXG4gICAgdGhpcy50YWdzLmZvckVhY2goKHRhZ01hcCwgdXJpKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IHRhZ01hcC5nZXQodGFnKVxuICAgICAgaWYgKGxpbmVzID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgbGluZXMuZm9yRWFjaCgoeyBjb250ZXh0LCBsaW5lIH0pID0+IHtcbiAgICAgICAgcmVzLnB1c2goeyB0YWcsIHVyaSwgY29udGV4dCwgbGluZSB9KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHByaXZhdGUgZmlsZXNDaGFuZ2VkID0gKGV2dHM6IEZpbGVzeXN0ZW1DaGFuZ2VFdmVudCkgPT4ge1xuICAgIGZvciAoY29uc3QgZXZ0IG9mIGV2dHMpIHtcbiAgICAgIGlmICghZXZ0LnBhdGguZW5kc1dpdGgoJy5ocycpICYmICFldnQucGF0aC5lbmRzV2l0aCgnLmxocycpKSBjb250aW51ZVxuICAgICAgc3dpdGNoIChldnQuYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2NyZWF0ZWQnOlxuICAgICAgICAgIHRoaXMudXBkYXRlKGV2dC5wYXRoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ21vZGlmaWVkJzpcbiAgICAgICAgICB0aGlzLnVwZGF0ZShldnQucGF0aClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdkZWxldGVkJzpcbiAgICAgICAgICB0aGlzLnRhZ3MuZGVsZXRlKGV2dC5wYXRoKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3JlbmFtZWQnOlxuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgdGhpcy50YWdzLmRlbGV0ZShldnQub2xkUGF0aCEpXG4gICAgICAgICAgdGhpcy51cGRhdGUoZXZ0LnBhdGgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhdGhzQ2hhbmdlZCA9IChwYXRoczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCByZW1vdmVkUGF0aHMgPSB0aGlzLnBhdGhzLmZpbHRlcigocCkgPT4gIXBhdGhzLmluY2x1ZGVzKHApKVxuICAgIGNvbnN0IGFkZGVkUGF0aHMgPSBwYXRocy5maWx0ZXIoKHApID0+ICF0aGlzLnBhdGhzLmluY2x1ZGVzKHApKVxuICAgIGlmIChyZW1vdmVkUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgQXJyYXkuZnJvbSh0aGlzLnRhZ3Mua2V5cygpKVxuICAgICAgICAuZmlsdGVyKChmKSA9PiByZW1vdmVkUGF0aHMuc29tZSgocCkgPT4gZi5zdGFydHNXaXRoKHAgKyBzZXApKSlcbiAgICAgICAgLmZvckVhY2goKGspID0+IHRoaXMudGFncy5kZWxldGUoaykpXG4gICAgfVxuICAgIGZvciAoY29uc3QgcGF0aCBvZiBhZGRlZFBhdGhzKSB7XG4gICAgICB0aGlzLnVwZGF0ZShwYXRoKVxuICAgIH1cbiAgICB0aGlzLnBhdGhzID0gcGF0aHNcbiAgfVxufVxuIl19