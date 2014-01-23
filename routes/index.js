var spawn = require('child_process').spawn
  , crypto = require('crypto')
  , fs = require('fs')
  , Q = require('q')
  , redis = require('redis').createClient();

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.crap = function(req, res){
  var blob = req.body.blob;
  var shasum = crypto.createHash('sha256');
  shasum.update(blob);
  var id = shasum.digest('hex').substr(0, 6);

  var converter = spawn("convert", ["text:-", "png:-"]);
  console.log('created stream')
  converter.stdout.pipe(fs.createWriteStream("images/" + id + ".png"));
  console.log('piped output to file')
  converter.stdin.end(req.body.blob, "utf-8", function() {
    console.log('ending stream');
  });
  redis.set("view_limit:" + id, req.body.views, function(err) {
    if (req.body.global_ttl) {
      redis.ttl("view_limit:" + id, req.body.global_ttl);
    }
  });
  redis.set("view_ttl:" + id, req.body.view_ttl || 10);
  res.redirect("/share/" + id);
};

exports.view = function(req, res) {
  redis.get("view_ttl:" + id, function(err, ttl) {
    res.render('view', { ttl: ttl, id: req.params.id });
  });
}

exports.share = function(req, res) {
  res.render('share', {id: req.params.id, host: req.app.get('host')});
}

exports.image = function(req, res) {
  var id = req.params.id;

  redis.get('view_limit:' + id, function(err, limit) {
    if (limit && limit > 0) {
      redis.hexists('ips:' + id, req.ip, function(err, e) {
        if (e == 0) {
         res.sendfile(id + ".png", { root: './images' });
         redis.hincrby('ips:' + id, req.ip, 1, function(err, e) {
           redis.hkeys('ips:' + id, function(err, keys) {
             redis.get('view_limit:' + id, function(err, limit) {
               if (keys.length >= Number(limit)) {
                 fs.unlink('./images/' + id + ".png");
                 redis.del('view_limit:' + id);
               }
             });
           });
         });
        } else {
          res.render('flushed', req.params)
        }
      });
    } else {
      res.render('flushed', req.params)
    }
  });
}
