var Hook = require('hook.io').Hook,
    http = require('http'),
    util = require('util');

var Webhook = exports.Webhook = function(options){
  var self = this;
  Hook.call(self, options);
  self.port = self.port || 9001;
  self.on('hook::ready', self._startHTTPServer);
};

util.inherits(Webhook, Hook);

Webhook.prototype._startHTTPServer = function(){
    var self = this;
    http.createServer(function(req, res){
        var body = '';
        req.on('data', function(data) { body += data; });
        req.on('end', function(){
          try {
            var json = JSON.parse(body);
            json.params.url = req.url;
            self.emit(json.method, json.params);
            res.end('{ "message": "OK" }');
          } catch(err) {
            self.emit('request', { url: req.url, body: body });
            res.end('{ "message": "OK" }');
          }
        });
      }).listen(self.port);

      self.log(self.name, 'http server started', self.port);
};