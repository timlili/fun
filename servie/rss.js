var http = require('http');
var cheerio = require('cheerio');
var Q = require('q');
var mongodb = require('mongodb');

function crawler(params) {
	return Q.Promise(function(resolve, reject, notify) {
		var server = new mongodb.Server('127.0.0.1', 10002);
		var Data = {
			type: 'news',
			list: []
		};
		switch (Data.type) {
			case 'news':
				params.url = 'http://tech.163.com/special/000944OI/hulianwang.xml';
				break;
			default:
				console.log('rss type error');
		}
		// test url: http://tech.163.com/special/000944OI/hulianwang.xml
		http.get(params.url, function(res) {
			res.on('data', function(d) {
				var $ = cheerio.load(d.toString('utf8'));
				if ($('item').length > 0) {
					$('item').each(function() {
						Data.list.push({
							title: $(this).find('title').text(),
							description: $(this).find('description').text(),
							link: $(this).find('link').text(),
							pubDate: $(this).find('pubDate').text()
						});
					})
				}
			}).on('error', function(e) {
				reject(e);
			}).on('end', function() {
				new mongodb.Db('mine-app', server, {safe: false}).open(function(err, db) {
					if (err)
						throw err;
					for (var i = 0, len = Data.list.length; i < len; i++) {
						var _data = Data.list[i];
						var _collection = db.collection('mine-app')
						_collection.insert({
							type: Data.type,
							title: _data.title,
							description: _data.description.toString(),
							link: _data.link,
							pubDate: _data.pubDate
						});
					}
					resolve(Data);
				});
			});
		})
	});

}

exports.crawler = crawler;