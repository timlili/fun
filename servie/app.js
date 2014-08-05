var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    rss = require("./rss"),
    schedule = require("node-schedule"),
    mongodb = require('mongodb');

var server = new mongodb.Server('127.0.0.1', 10002);

http.createServer(function(req, res) {console.log(req.method)
    var _root = path.resolve('..', 'static');
    var _url = url.parse(req.url);
    var pathname = _root + _url.pathname;
    fs.exists(pathname, function(exists) {
        if (exists && path.extname(pathname)) {
            switch (path.extname(pathname)) {
                case ".html":
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    break;
                case ".js":
                    res.writeHead(200, {
                        "Content-Type": "text/javascript"
                    });
                    break;
                case ".css":
                    res.writeHead(200, {
                        "Content-Type": "text/css"
                    });
                    break;
                case ".gif":
                    res.writeHead(200, {
                        "Content-Type": "image/gif"
                    });
                    break;
                case ".jpg":
                    res.writeHead(200, {
                        "Content-Type": "image/jpeg"
                    });
                    break;
                case ".png":
                    res.writeHead(200, {
                        "Content-Type": "image/png"
                    });
                    break;
                default:
                    res.writeHead(200, {
                        "Content-Type": "application/octet-stream"
                    });
            }
            fs.readFile(pathname, function(err, data) {
                res.end(data);
            });
        } else {
            switch(_url.pathname) {
                case '/':
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    fs.readFile(_root + '/index.html', function(err, data){
                        res.end(data);
                    });
                    break;
                case '/photo':
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({image:[0,1,2,3,4,5,6,7,8,9,10]}));    
                    break;
                case '/news':
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    var _response;
                    new mongodb.Db('mine-app', server, {safe: false}).open(function(err, db) {
                        if (err){
                            _response = {
                                result: "fail",
                                reason: err
                            };
                            res.end(JSON.stringify(_response));
                        } else {
                            db.collection('mine-app', function(err, collection){
                                collection.find({}, {_id: 0}).toArray(function(err, data){
                                    _response = {
                                        result: "succ",
                                        data: data
                                    };
                                    res.end(JSON.stringify(_response));
                                });
                            })   
                        }
                    });
                    break;
                default:
                    res.writeHead(404, {
                        "Content-Type": "text/html"
                    });
                    res.end("<h1>404 Not Found</h1>");    
                    break;
            }
        }
    });
}).listen(8080, "127.0.0.1");

//schedule crawler news every day 8:00AM
schedule.scheduleJob({hour: 8, minute: 0, dayOfWeek: [0, new schedule.Range(1, 6)]}, function() {
    rss.crawler({
       type: 'news' 
    }).then(function(){
        console.log('rss crawler succ');
    }, function(error) {
        console.log('rss crawler fail:' + error);
    });
});

