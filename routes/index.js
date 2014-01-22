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
  var digest = shasum.digest('hex').substr(0, 6);

  var converter = spawn("convert", ["text:-", "png:-"]);
  console.log('created stream')
  converter.stdout.pipe(fs.createWriteStream("images/"+digest+".png"));
  console.log('piped output to file')
  converter.stdin.end(req.body.blob, "utf-8", function() {
    console.log('ending stream');
  });
  redis.set(digest, req.body.views);
  res.redirect("/share/"+digest);
};

exports.share = function(req, res) {
  res.render('share', req.params);
}

exports.image = function(req, res) {
  Q.nfcall(redis.hexists.bind(redis), req.params.hash, req.ip).done(function() {
    console.log(arguments);
    res.sendfile(req.params.hash + ".png", {root: './images'});
    //res.render('flushed', req.params);
  })
}
