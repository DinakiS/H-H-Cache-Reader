const express = require('express'),
    fs = require('fs');
let app = express(),
    config = require('./config');

app.get('/', (req, res) => {
    let css = fs.readFileSync('./css.css', 'utf8'),
        js = fs.readFileSync('./js.js', 'utf8'),
        tmpl = fs.readFileSync('./tmpl.html', 'utf8');

    let page = parseInt(req.query.page) || 0;

    if (!config.cacheFolder) {
        res.send('Write path to the folder in <b>config.json</b>');
    } else {
        let html = '',
            offset = page * config.imgPerPage,
            limit = offset + config.imgPerPage;

        let files = getAllFiles(config.cacheFolder, { offset: offset, limit: limit });

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
            files: files.length
        }

        Object.keys(replace).forEach(key => tmpl = tmpl.replace(`{{${key}}}`, replace[key]));
        res.set('Content-Type', 'text/html');
        res.send(tmpl);
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

    return result;

    function getAllStats(dir, opt) {
        let list = fs.readdirSync(dir);
        let res = [];
        
        list.forEach((file) => {
            file = dir + '/' + file;
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

app.listen(config.port, () => {
    console.log(`Server on ${config.port} port`);
})
