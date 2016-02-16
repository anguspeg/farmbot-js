!function(e,t){"function"==typeof define&&define.amd?define(t):"object"==typeof exports?module.exports=t(require,exports,module):e.Farmbot=t()}(this,function(e,t,n){return function(e){"use strict";function t(e){if(!(this instanceof t))return new t(e);var n={};t.extend(n,[t.config.defaultOptions,e]),t.requireKeys(n,t.config.requiredOptions),this.listState=function(){return Object.keys(n)},this.getState=function(e){return n[e]},this.setState=function(e,t){if(t!==n[e]){var r=n[e];n[e]=t,this.emit("change",{name:e,value:t,oldValue:r})}return t}}return t.prototype.emergencyStop=function(){return this.send({params:{},method:"single_command.EMERGENCY STOP"})},t.prototype.execSequence=function(e){return this.send({params:e,method:"exec_sequence"})},t.prototype.homeAll=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.HOME ALL"})},t.prototype.homeX=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.HOME X"})},t.prototype.homeY=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.HOME Y"})},t.prototype.homeZ=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.HOME Z"})},t.prototype.moveAbsolute=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.MOVE ABSOLUTE"})},t.prototype.moveRelative=function(e){return t.requireKeys(e,["speed"]),this.send({params:e,method:"single_command.MOVE RELATIVE"})},t.prototype.pinWrite=function(e){return t.requireKeys(e,["pin","value1","mode"]),this.send({params:e,method:"single_command.PIN WRITE"})},t.prototype.readStatus=function(){return this.send({params:{},method:"read_status"})},t.prototype.syncSequence=function(){return console.warn("Not yet implemented"),this.send({params:{},method:"sync_sequence"})},t.prototype.updateCalibration=function(e){return this.send({params:e||{},method:"update_calibration"})},t.config={requiredOptions:["uuid","token","meshServer","timeout"],defaultOptions:{speed:100,meshServer:"meshblu.octoblu.com",timeout:6e3}},t.prototype.event=function(e){return this.__events=this.__events||{},this.__events[e]=this.__events[e]||[],this.__events[e]},t.prototype.on=function(e,t){this.event(e).push(t)},t.prototype.emit=function(e,t){[this.event(e),this.event("*")].forEach(function(n){n.forEach(function(n){try{n(t,e)}catch(r){console.warn("Exception thrown while handling `"+e+"` event.")}})})},t.prototype.buildMessage=function(e){var n=e||{},r={devices:n.devices||this.getState("uuid"),id:n.id||t.uuid()};return t.extend(n,[r]),t.requireKeys(n,["params","method","devices","id"]),n},t.prototype.sendRaw=function(e){if(this.socket){var t=this.buildMessage(e);return this.socket.send(JSON.stringify(["message",t])),t}throw new Error("You must connect() before sending data")},t.prototype.send=function(e){var n=this,r=n.sendRaw(e),o=t.timerDefer(n.getState("timeout"),r.method+" "+r.params);return n.on(r.id,function(e){var t=e&&e.result?o.resolve:o.reject;t(e)}),o},t.prototype.__newSocket=function(){return new WebSocket("ws://"+this.getState("meshServer")+"/ws/v2")},t.prototype.__onclose=function(){delete this.socket,this.emit("disconnect",this)},t.prototype.__onmessage=function(e){var n=t.decodeFrame(e.data),r={name:"unknown",message:{}},o=(n.message||r).id;o?this.emit(o,n.message):this.emit(n.name,n.message)},t.prototype.__newConnection=function(e){var n=this,r=t.timerDefer(n.getState("timeout"),"__newConnection"),o=n.__newSocket();return o.onopen=function(){o.send(t.encodeFrame("identity",e))},o.onmessage=n.__onmessage.bind(n),o.onclose=n.__onclose.bind(n),n.on("ready",function(){n.socket=o,r.resolve(n)}),r},t.prototype.connect=function(){function e(){n.socket.send(t.encodeFrame("subscribe",n)),r.resolve(n)}var n=this,r=t.timerDefer(n.getState("timeout"),"subscribing to device");return t.registerDevice().then(function(e){return n.__newConnection(e)}).then(e)},t.defer=function(e){var t,n,r=new Promise(function(e,r){t=r,n=e});return r.finished=!1,r.reject=function(){r.finished=!0,t.apply(r,arguments)},r.resolve=function(){r.finished=!0,n.apply(r,arguments)},r.label=e||"a promise",r},t.timerDefer=function(e,n){n=n||"promise with "+e+" ms timeout";var r=t.defer(n);if(!e)throw new Error("No timeout value set.");return setTimeout(function(){if(!r.finished){var e=new Error("`"+n+"` did not execute in time");r.reject(e)}},e),r},t.encodeFrame=function(e,t){return JSON.stringify([e,t])},t.decodeFrame=function(e){var t=JSON.parse(e);return{name:t[0],message:t[1]}},t.__newXHR=function(e,n){var n=n||"//meshblu.octoblu.com",e=e||t.config.defaultOptions.timeout,r=new XMLHttpRequest;return r.open("POST",n+"/devices?type=farmbotjs_client",!0),r},t.registerDevice=function(e,n){var e=e||t.config.defaultOptions.timeout,r=t.__newXHR(e,n),o=t.timerDefer(e,"Registeration of device");return r.onload=function(e){return r.status>=200&&r.status<400?o.resolve(JSON.parse(r.responseText)):o.reject(e)},r.onerror=o.reject,r.send(),o},t.extend=function(e,t){return t.forEach(function(t){var n=function(n){e[n]=t[n]};Object.keys(t).forEach(n)}),e},t.requireKeys=function(e,t){t.forEach(function(t){var n=e[t];if(!n&&0!==n)throw new Error("Expected input object to have `"+t+"` property")})},t.uuid=function(){var e="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",t=function(e){var t=16*Math.random()|0,n="x"===e?t:3&t|8;return n.toString(16)};return e.replace(/[xy]/g,t)},t.token=function(){for(var e=function(){var e=65536*(1+Math.random());return Math.floor(e).toString(16).substring(1)},t=10,n=[];t--;)n.push(e());return n.join("")},t.MeshErrorResponse=function(e){return{error:{method:"error",error:e||"unspecified error"}}},t}(this)});