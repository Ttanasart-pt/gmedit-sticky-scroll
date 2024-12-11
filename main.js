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
                //console.log("Cheking row: " + row);

                tokens.forEach(element => {
                    if (element.value == '{') {
                        selectors.push([row, tokens]);
                        //console.log(row + " : push " + element.value);
                    }

                    if (row < currentRow + selectors.length && element.value == '}') {
                        selectors.pop();
                        //console.log(row + " : pop " + element.value);
                    }
                    
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
            stickyEl.style.paddingLeft = (gutterWidth + 3) + 'px';
            stickyEl.style.width = stickyEl.parentElement.offsetWidth + 'px';
    
            // container.querySelector('.ace_scrollbar-v').style.height = `calc(100% - ${(selectors.length * 19) + 16}px)`;

            // var currentPosition = editor.getCursorPosition();

            // const fillerString = '​​​​​END OF LINE​​​​​';

            // let allLines = editor.session.getDocument().getAllLines();

            // var fillerLines = allLines.filter(line => line == fillerString);
            // var totalLines = allLines.filter(line => line != fillerString);
            // var difference = selectors.length - fillerLines.length;

            // console.log(allLines);
            // console.log(allLines.length);
            // console.log(difference);
            // console.log(totalLines.length);
            // console.log(fillerLines);
            // console.log(fillerLines.length);
            // console.log(difference);

            // if (difference > 0) {
            //     for (let i = 0; i < difference; i++) {
            //         editor.session.insert({
            //             row: Number.POSITIVE_INFINITY,
            //             column: 0
            //         }, '\n' + fillerString);
            //     }
            // }
            // else if (difference < 0) {
            //     editor.session.remove({
            //         start: { row: totalLines.length, column: 0 },
            //         end: { row: totalLines.length - difference, column: 0 }
            //     });
            // }

            
            // console.log(allLines);
            // console.log('-----');

            // editor.moveCursorToPosition(currentPosition);
        }
    }
    
    editor.renderer.on("afterRender", () => stickyScroll());
}

function init() {
    stickyEditor(aceEditor);

    GMEdit.on("editorCreated", function(e) {
        let editor = e.editor;
        stickyEditor(editor);
    });
}

(function() {
    GMEdit.register("sticky-scroll", { init: init });
})();