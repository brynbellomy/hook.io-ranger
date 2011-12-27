//
// ranger (part of zordon, a WAN transport plugin for hook.io)
// bryn austin bellomy / signalenvelope dec 2011
//

var Hook = require('hook.io').Hook,
    util = require('util')

var Ranger = exports.Ranger = function Ranger(options, _myZordon) {
  // you can have a colorful name
  if (!options.name) options.name = Ranger.rangerColors[Math.floor(Math.random() * 10)] + '-ranger'
  
  Hook.call(this, options)
  var self = this
  
  /* member vars */
  self.myZordon = _myZordon
  
  /* caught events */
  self.on('hook::ready', self.onHookReady.bind(self))
  self.on('*::ranger::*', function(data, cb) {
    self.myZordon.rangerRelay(this.event, data, cb) })
  self.on('ranger::*', function(heardRanger, cb) {
    if (heardRanger.name != self.name)
      self.myZordon.rangerRelay(this.event, heardRanger, cb) })
  self.on('zordon::brawwwr', function(heardZordon, cb) {
    if (heardZordon.name != self.myZordon.name)
      self.myZordon.rangerRelay(this.event, heardZordon, cb) })
  
  /* error handling */
  self.on('error::*', self.onError.bind(self))
}

// Ranger inherits from Hook
util.inherits(Ranger, Hook)


/* event handlers */

Ranger.prototype.onFoundOtherRanger = function(data, cb) {
  self.myZordon.rangerRelay(this.event, data, cb)
}

Ranger.prototype.onError = function (err, cb) {
  var self = this
  if (err.code == 'EADDRNOTAVAIL')
    self.connect()
  else
    console.error("** ERROR >>", arguments)
}

Ranger.prototype.onHookReady = function(data) {
  var self = this
  
  /* tell 'em, kid! */
  self.emitIExist()
  
  /* setup timers */
  setInterval(self.emitIExist.bind(self), self.myZordon.options['ranger-broadcast-interval'] * 1000)
}

Ranger.prototype.emitIExist = function() {
  var self = this
  var message = {
    name: self.name,
    myZordon: {
      name: self.myZordon.name,
      addr: self.myZordon['hook-host'] || null,
      port: self.myZordon['hook-port'] || null
    },
    addr: self['hook-host'] || null,
    port: self['hook-port'] || null,
    knownZordons: self.myZordon.otherZordons
  }
  self.emit('ranger::new-dude-in-town', message)
}

Ranger.rangerColors = [ 'red', 'pink', 'blue', 'yellow', 'black', 'green', 'white', 'orange', 'purple', 'mauve' ]



