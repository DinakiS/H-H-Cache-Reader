const express = require('express'),
      fs = require('fs'),
      bodyParser = require('body-parser');

let app = express(),
    config = require('./config');

app.use(express.static('www'));
app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    let css = fs.readFileSync('./www/css/css.css', 'utf8'),
        js = fs.readFileSync('./www/js/js.js', 'utf8'),
        tmpl = fs.readFileSync('./www/tmpl.html', 'utf8');

    let page = parseInt(req.query.page) || 0;

    if (!config.cacheFolder) {
        res.send('Write path to the folder in <b>config.json</b>');
    } else {
        let html = '',
            offset = page * config.imgPerPage,
            limit = offset + config.imgPerPage,
            favCat = req.query.category != null ? req.query.category : 'default';

        let {files, count} = req.query.favorite != null ? getFavorites(favCat, { offset: offset, limit: limit }) :
            getAllFiles(config.cacheFolder, { offset: offset, limit: limit });


        files.forEach(file => {
            html += `<div class="img-preview-wrap"><img src="data:image/jpeg;base64,${new Buffer(file.file).toString('base64')}" class='preview' alt="${file.path}"></div>`;
        })

        /*files.forEach((file) => {
            html += `<img src="data:image/jpeg;base64,${new Buffer(file.file).toString('base64')}" class='preview' data-path="${file.path}">`;
        })*/

        let replace = {
            css: css,
            js: js,
            content: html,
            files: count,
            onPage: files.length,
            perPage: config.imgPerPage,
            offset: offset
        }

        Object.keys(replace).forEach(key => tmpl = tmpl.replace(`{{${key}}}`, replace[key]));
        res.set('Content-Type', 'text/html');
        res.send(tmpl);
    }
})
app.post('/favorite', (req, res) => {
    let fav = getFavJson();
    
    let path = req.body.path;
    
    let alreadyInFav = fav.default.filter(item => item.path === path).length;
    if (!alreadyInFav) {
        fav.default.push({ path: path, date: Date.now() });
        fs.writeFileSync('./favorites.json', JSON.stringify(fav));
        res.send('Ok');
    } else {
        // TODO: Remove from fav
        res.send('Already in favorites');
    }
})

function getAllFiles(dir, opt = { offset: 0, limit: config.imgPerPage }) {
    let result = [];
    let statList = getAllStats(dir, opt);
    
    opt.limit = opt.limit > statList.length ? statList.length : opt.limit;

    for (let i = opt.offset; i < opt.limit; i++) {
        result.push({
            file: fs.readFileSync(statList[i].path),
            stat: statList[i].stat,
            path: statList[i].path
        });
    }

    return { files: result, count: statList.length};

    function getAllStats(dir, opt) {
        let list = fs.readdirSync(dir);
        let res = [];
        
        list.forEach((file) => {
            file = dir + '\\' + file;
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory())
                res = res.concat(getAllStats(file));
            else
                res.push({ stat: stat, path: file });
        })

        res.sort((a, b) => {
            return b.stat['birthtime'] - a.stat['birthtime']
        })

        return res;
    }
}
function getFavorites(category, opt = { offset: 0, limit: config.imgPerPage }) {
    let fav = getFavJson(),
        stats = null,
        result = [];
    
    fav[category].sort((a,b) => b.date - a.date);
    
    opt.limit = opt.limit > fav[category].length ? fav[category].length : opt.limit;
    
    for (let i = opt.offset; i < opt.limit; i++) {
        result.push({
            file: fs.readFileSync(fav[category][i].path),
            //stat: statList[i].stat,
            path: fav[category][i].path
        });
    }
    
    return { files: result, count: fav[category].length };
    
    /*fav[category].forEach(fileInfo => {
        let stat = fs.statSync(fileInfo.path);
        if (stat && stat.isFile()) {
            stats.push({ path: fileInfo.path, stat: stat });
        }
    })*/
}

function getFavJson() {
    let fav = '{"default": []}';
    if (fs.existsSync('./favorites.json')) {
        fav = fs.readFileSync('./favorites.json', 'utf8');
    } else {
        fs.writeFileSync('./favorites.json', fav);
    }
    
    try {
        fav = JSON.parse(fav);
    } catch (e) {
        fav = {
            default: []
        }
    }
    return fav;
}

app.listen(config.port, () => {
    console.log(`Server on ${config.port} port`);
})
