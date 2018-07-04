const config = {
    filesTotal: parseInt('{{files}}'),
    onPage: parseInt('{{onPage}}'),
    perPage: parseInt('{{perPage}}'),
    offset: parseInt('{{offset}}'),
}
config.totalPages = Math.ceil(config.filesTotal / config.perPage);
config.currPage = parseInt(config.offset / config.perPage);

window.onload = () => {
    let modal = document.getElementById('imgModal'),
        modalImg = document.getElementById('modalImg'),
        stat = document.getElementById('stat');

    let images = document.querySelectorAll('img.preview');
    images.forEach(img => {
        img.onclick = (event) => {
            let t = event.currentTarget;
            modal.style.display = 'block';
            modalImg.src = t.src;
            modalImg.alt = t.alt;
            stat.innerHTML = t.alt;
            
            utils.removeSelected();
            t.classList.add("selected");
        }
    })

    modal.onclick = function (event) {
        if (event.target.id == 'imgModal' || event.target.id == 'closeModal') {
            modal.style.display = 'none';
            utils.removeSelected();
        }
    }

    let buttons = document.querySelectorAll('.pages button');
    buttons.forEach(btn => {
        btn.onclick = event => {
            let target = event.currentTarget;
            if (target.textContent == '<') {
                Pagination.Prev()
            } else if (target.textContent == '>') {
                Pagination.Next()
            }
        }
    })

    document.getElementById('addToFav').onclick = function (event) {
        let xhr = new XMLHttpRequest();

        let body = 'path=' + encodeURIComponent(document.getElementById('modalImg').alt);

        xhr.open('POST', '/favorite', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.send(body);
        document.getElementById('addToFav').classList.add('active');
    }
}

const utils = {
    isModal: function() {
        return document.getElementById('imgModal').style.display === 'block';
    },
    removeSelected: function() {
        let list = document.querySelectorAll('.selected');

        list.forEach(item => item.classList.remove('selected'));
    }
}

// Pagination
var pagesInit = function () {
    Pagination.Init(document.getElementById('pagination'), {
        size: config.totalPages, // pages size
        page: config.currPage + 1, // selected page
        step: 3 // pages before and after current
    });
};

document.addEventListener('DOMContentLoaded', pagesInit, false);

function updateQueryStringParameter(key, value) {
    var uri = location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        location.href = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        location.href = uri + separator + key + "=" + value;
    }
}
