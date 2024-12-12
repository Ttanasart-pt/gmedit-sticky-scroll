function tokenOpen(token) {
    var val = token.value.trim();
    return val == '{' || val == '#region';
}

function tokenClose(token) {
    var val = token.value.trim();
    return val == '}' || val == '#endregion';
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
        const session = editor.session;
        const lonelyBrace = /^\s*\{\s*$/;
        
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
                    if(element.value == '#event') {
                        if(row < currentRow + selectors.length) {
                            if(selectors.length > 0)
                                selectors.pop();
                            selectors.push([row, tokens, 0]);
                        } else {
                            let top = selectors.pop();
                            selectors.push([top[0], top[1], -shft]);
                        }
                        return;
                    }

                    if (tokenOpen(element)) {
                        let pushTokens = tokens;
                        if (row > 0 && lonelyBrace.test(session.getLine(row))) {
                            pushTokens = session.getTokens(row - 1);
                        }
                        selectors.push([row, pushTokens, 0]);
                    }

                    if (tokenClose(element)) {
                        if(row < currentRow + selectors.length) //prevent pop 1 line too early
                            selectors.pop();
                        else {
                            let top = selectors.pop();
                            selectors.push([top[0], top[1], -shft]);
                        }
                    }
                    
                });

                row++;
            }

            if(selectors.length == 0) {
                stickyEl.style.display = 'none';
                return;
            }

            stickyEl.style.display = 'block';
            let i = 0;
            let h = 2;
            
            stickyEl.innerHTML = selectors.map(([row, tokens, offset], length) => {
                i++;
                h += lheight + offset;

                let content = `<div class="ace_line" style="transform: translateY(${offset}px); clip-path: inset(${-offset}px 0px -10px 0px);">`;

                //content += new Array(length).fill(null).map(() => '<span class="">    </span>').join('');
                content += tokens.map((token) => token.type == "text" ? token.value.replace(/\t/g, '    ') : `<span class="${
                                 token.type.split(".").map((type) => `ace_${type}`).join(" ")
                                 }">${token.value}</span>`)
                                 .join('');
                content += '</div>';
                                 
                return content;
            }).join('');

            stickyEl.style.height = h + 'px';
    
            let gutterWidth = container.querySelector('.ace_gutter').offsetWidth;
            stickyEl.style.paddingLeft = gutterWidth + 3 + 'px'; //shouldn't be hardcoded I guess, line keep shifting around
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