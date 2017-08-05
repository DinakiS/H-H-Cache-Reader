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
        let files = getAllFiles(config.cacheFolder);
        
        
        files.sort((a, b) => {
            return b.stat['birthtime'] - a.stat['birthtime']
        })
        
        let html = '',
            offset = page * config.imgPerPage,
            limit = offset + config.imgPerPage;
        
        limit = limit < files.length ? limit : files.length;
        
        for (let i = offset; i < limit; i++) {
            let file = files[i];
            html += `<img src="data:image/jpeg;base64,${new Buffer(file.file).toString('base64')}" class='preview' data-path="${file.path}">`;
        } 
        
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

function getAllFiles(dir) {
    let result = [];
    let list = fs.readdirSync(dir);
    
    list.forEach((file) => {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) 
            result = result.concat(getAllFiles(file));
        else 
            result.push({ file: fs.readFileSync(file), stat: stat, path: file });
    })
    
    return result;
}

app.listen(config.port, () => {
    console.log(`Server on ${config.port} port`);
})