function tokenOpen(token) {
    var val = token.value.trim();
    return val == '{' || val.startsWith('#region');
}

function tokenClose(token) {
    var val = token.value.trim();
    return val == '}' || val.startsWith('#endregion');
}

function stickyEditor(editor) {
    let container = editor.container;
    let stickyEl  = container.querySelector('.ace_scroller');
    
    if (stickyEl.nextElementSibling.classList[0] == 'ace_scrollbar') {
        stickyEl.insertAdjacentHTML("beforebegin", "<div class='ace_sticky-content ace_layer'></div>");
    
        container.style.alignSelf = 'flex-end';
        stickyEl.parentElement.style.contain = 'content';
    }
    
    stickyEl = stickyEl.previousElementSibling;
    
    function stickyScroll() {
        if (editor.session.getScrollTop() != this.scrollTop) {
            this.scrollTop = editor.session.getScrollTop();
            
            let selectors  = [];
            let conf       = editor.renderer.layerConfig;
            let currentRow = conf.firstRow;
            let offset     = conf.offset;
            let lheight    = conf.lineHeight;
            let shft       = offset % lheight;
            let row = 0;

            if(offset > 0)
            while (row < currentRow + 1 + selectors.length) {
                let tokens = editor.session.getTokens(row);

                tokens.forEach(element => {
                    if (tokenOpen(element))
                        selectors.push([row, tokens, 0]);

                    if (tokenClose(element)) { //prevent pop 1 line too early
                        if(row < currentRow + selectors.length)
                            selectors.pop();
                        else {
                            let top = selectors.pop();
                            selectors.push([top[0], top[1], -shft]);
                        }
                    }
                    
                });

                row++;
            }

            let i = 0;
            let h = 0;
            
            stickyEl.innerHTML = selectors.map(([row, tokens, offset], length) => {
                let content = "";

                i++;
                h += lheight + offset;
                content += tokens.map((token) => token.type == "text" ? token.value.replace(/\t/g, '') : `<span class="${
                                 token.type.split(".").map((type) => `ace_${type}`).join(" ")
                                 }">${token.value}</span>`)
                                 .join('')

                return `<div class="ace_line" style="transform: translateY(${offset}px); clip-path: inset(${-offset}px 0px -10px 0px);">${content}</div>`;
            }).join('');

            stickyEl.style.height = h + 'px';
    
            let gutterWidth = container.querySelector('.ace_gutter').offsetWidth;
            stickyEl.style.paddingLeft = (gutterWidth + 2) + 'px';
            stickyEl.style.width = stickyEl.parentElement.offsetWidth + 'px';
        }
    }
    
    editor.renderer.on("afterRender", () => stickyScroll());
}

function init() {
    stickyEditor(aceEditor);
    GMEdit.on("editorCreated", function(e) { stickyEditor(e.editor); });
}

(function() { GMEdit.register("sticky-scroll", { init: init }); })();