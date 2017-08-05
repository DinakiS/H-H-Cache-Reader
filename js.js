window.onload = () => {
    let images = document.querySelectorAll('img.preview');
    images.forEach(img => {
        img.onclick = (event) => { 
            event.currentTarget.classList.toggle('preview')
        }
    })
    
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

