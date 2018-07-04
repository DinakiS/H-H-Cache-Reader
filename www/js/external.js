// ====== Keyboard ======
    document.onkeyup = function(event) {
        const keys = {
            '37': goLeft,
            '38': scrollTop,
            '39': goRight,
            '40': scrollDown
        }
        
        if (keys[event.keyCode] != null) {
            keys[event.keyCode]();
            event.preventDefault();
        }
        
        function goLeft() { go('left') }
        function goRight() { go('right') }
        function scrollTop() {
            document.getElementById('imgModal').scrollTop -= 100;
        }
        function scrollDown() {
            document.getElementById('imgModal').scrollTop += 100;
        }
        
        function go(dir='right') {
            if (utils.isModal()) {
                let parent = document.querySelector('.selected').parentElement;
                let next = null;
                if (dir == 'right') {
                    next = parent.nextSibling
                } else {
                    next = parent.previousSibling
                }
                
                if (next.nodeName == "DIV") {
                    next.children[0].click();
                    return true;
                }
                return false;
            }
        }
    }