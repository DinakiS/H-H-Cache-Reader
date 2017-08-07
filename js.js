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
            stat.innerHTML = t.alt;
        }
    })

    modal.onclick = function (event) {
        if (event.target.id == 'imgModal' || event.target.id == 'closeModal') {
            modal.style.display = 'none';
        }
    }

    let buttons = document.querySelectorAll('.pages button');
    buttons.forEach(btn => {
        btn.onclick = event => {
            let target = event.currentTarget;
            let currPage = location.search.match(/page=(\d+)/);
            currPage = currPage ? parseInt(currPage[1]) : 0;

            if (target.textContent == '<') {
                currPage--;
            } else if (target.textContent == '>') {
                currPage++;
            }

            if (currPage < 0) currPage = 0;

            location.search = 'page=' + currPage;
        }
    })

}
