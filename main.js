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
            
            let selectors = [];
            let currentRow = editor.renderer.layerConfig.firstRow;
            let offset = editor.renderer.layerConfig.offset;
            let row = 0;

            if(offset > 0)
            while (row < currentRow + 1 + selectors.length) {
                let tokens = editor.session.getTokens(row);

                tokens.forEach(element => {
                    if (element.value == '{')
                        selectors.push([row, tokens]);

                    if (row < currentRow + selectors.length && element.value == '}') //prevent pop 1 line too early
                        selectors.pop();
                    
                });

                row++;
            }

            stickyEl.innerHTML = selectors.map(([row, tokens], length) => {
                let content = "";

                content += tokens.map((token) => token.type == "text" ? token.value.replace(/\t/g, '') : `<span class="${
                                 token.type.split(".").map((type) => `ace_${type}`).join(" ")
                                 }">${token.value}</span>`)
                                 .join('')

                return `<div class="ace_line">${content}</div>`;
            }).join('');
    
            let gutterWidth = container.querySelector('.ace_gutter').offsetWidth;
            stickyEl.style.paddingLeft = (gutterWidth + 4) + 'px';
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