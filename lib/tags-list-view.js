"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SelectListView = require("atom-select-list");
const etch = require("etch");
async function selectListView(items, inProgress) {
    let panel;
    let res;
    try {
        res = await new Promise((resolve) => {
            const select = new SelectListView({
                items,
                infoMessage: inProgress ? 'Update is in progress' : undefined,
                elementForItem: (item) => etch.render(etch.dom("li", { class: "two-lines" },
                    etch.dom("div", { class: "primary-line", style: { float: 'right' } }, item.context),
                    etch.dom("div", { class: "primary-line" }, item.tag),
                    etch.dom("div", { class: "secondary-line" },
                        item.uri,
                        ": ",
                        item.line))),
                filterKeyForItem: item => item.tag,
                didCancelSelection: () => {
                    resolve();
                },
                didConfirmSelection: (item) => {
                    resolve(item);
                },
                maxResults: 400,
            });
            select.element.classList.add('ide-haskell');
            panel = atom.workspace.addModalPanel({
                item: select,
                visible: true,
            });
            select.focus();
        });
    }
    finally {
        panel && panel.destroy();
    }
    return res;
}
exports.selectListView = selectListView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFncy1saXN0LXZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFncy1saXN0LXZpZXcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQW1EO0FBRW5ELDZCQUE0QjtBQUVyQixLQUFLLFVBQVUsY0FBYyxDQUNsQyxLQUFlLEVBQ2YsVUFBbUI7SUFFbkIsSUFBSSxLQUFnRCxDQUFBO0lBQ3BELElBQUksR0FBdUIsQ0FBQTtJQUMzQixJQUFJO1FBQ0YsR0FBRyxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQXFCLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUM7Z0JBQ2hDLEtBQUs7Z0JBQ0wsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLFNBQVM7Z0JBQzdELGNBQWMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDbkMsaUJBQUksS0FBSyxFQUFDLFdBQVc7b0JBQ25CLGtCQUFLLEtBQUssRUFBQyxjQUFjLEVBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFHLElBQUksQ0FBQyxPQUFPLENBQU87b0JBQ3pFLGtCQUFLLEtBQUssRUFBQyxjQUFjLElBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBTztvQkFDMUMsa0JBQUssS0FBSyxFQUFDLGdCQUFnQjt3QkFBRSxJQUFJLENBQUMsR0FBRzs7d0JBQUksSUFBSSxDQUFDLElBQUksQ0FBTyxDQUN0RCxDQUNTO2dCQUNoQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHO2dCQUNsQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7b0JBQ3ZCLE9BQU8sRUFBRSxDQUFBO2dCQUNYLENBQUM7Z0JBQ0QsbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNmLENBQUM7Z0JBQ0QsVUFBVSxFQUFFLEdBQUc7YUFDaEIsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQzNDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztnQkFDbkMsSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUE7WUFDRixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDaEIsQ0FBQyxDQUFDLENBQUE7S0FDSDtZQUFTO1FBQ1IsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUN6QjtJQUNELE9BQU8sR0FBRyxDQUFBO0FBQ1osQ0FBQztBQXRDRCx3Q0FzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2VsZWN0TGlzdFZpZXcgPSByZXF1aXJlKCdhdG9tLXNlbGVjdC1saXN0JylcbmltcG9ydCB7IFBhbmVsIH0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIGV0Y2ggZnJvbSAnZXRjaCdcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGVjdExpc3RWaWV3KFxuICBpdGVtczogU3ltUmVjW10sXG4gIGluUHJvZ3Jlc3M6IGJvb2xlYW4sXG4pOiBQcm9taXNlPFN5bVJlYyB8IHVuZGVmaW5lZD4ge1xuICBsZXQgcGFuZWw6IFBhbmVsPFNlbGVjdExpc3RWaWV3PFN5bVJlYz4+IHwgdW5kZWZpbmVkXG4gIGxldCByZXM6IFN5bVJlYyB8IHVuZGVmaW5lZFxuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IG5ldyBQcm9taXNlPFN5bVJlYyB8IHVuZGVmaW5lZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGVjdCA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICAgIGl0ZW1zLFxuICAgICAgICBpbmZvTWVzc2FnZTogaW5Qcm9ncmVzcyA/ICdVcGRhdGUgaXMgaW4gcHJvZ3Jlc3MnIDogdW5kZWZpbmVkLFxuICAgICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0pID0+IGV0Y2gucmVuZGVyKFxuICAgICAgICAgIDxsaSBjbGFzcz1cInR3by1saW5lc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByaW1hcnktbGluZVwiIHN0eWxlPXt7IGZsb2F0OiAncmlnaHQnIH19PntpdGVtLmNvbnRleHR9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJpbWFyeS1saW5lXCI+e2l0ZW0udGFnfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlY29uZGFyeS1saW5lXCI+e2l0ZW0udXJpfToge2l0ZW0ubGluZX08L2Rpdj5cbiAgICAgICAgICA8L2xpPixcbiAgICAgICAgKSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgZmlsdGVyS2V5Rm9ySXRlbTogaXRlbSA9PiBpdGVtLnRhZyxcbiAgICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0sXG4gICAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IChpdGVtKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShpdGVtKVxuICAgICAgICB9LFxuICAgICAgICBtYXhSZXN1bHRzOiA0MDAsIC8vIEF2b2lkIHRlcnJpZnlpbmcgc2xvd2Rvd25zIHdoZW4gdGhlcmUgYXJlIGxvdHMgb2Ygc3ltYm9scy5cbiAgICAgIH0pXG4gICAgICBzZWxlY3QuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpZGUtaGFza2VsbCcpXG4gICAgICBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgICBpdGVtOiBzZWxlY3QsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICB9KVxuICAgICAgc2VsZWN0LmZvY3VzKClcbiAgICB9KVxuICB9IGZpbmFsbHkge1xuICAgIHBhbmVsICYmIHBhbmVsLmRlc3Ryb3koKVxuICB9XG4gIHJldHVybiByZXNcbn1cbiJdfQ==
