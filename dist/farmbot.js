"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_1 = require("mqtt");
var util_1 = require("./util");
var util_2 = require("./util");
var config_1 = require("./config");
exports.NULL = "null";
var RECONNECT_THROTTLE = 1000;
var Farmbot = /** @class */ (function () {
    function Farmbot(input) {
        var _this = this;
        this.getConfig = function (key) { return _this.config[key]; };
        this.setConfig = function (key, value) {
            _this.config[key] = value;
        };
        this.on = function (event, callback) { return _this.event(event).push(callback); };
        this._events = {};
        this.config = config_1.generateConfig(input);
    }
    /** Installs a "Farmware" (plugin) onto the bot's SD card.
     * URL must point to a valid Farmware manifest JSON document. */
    Farmbot.prototype.installFarmware = function (url) {
        return this.send(util_1.rpcRequest([{ kind: "install_farmware", args: { url: url } }]));
    };
    /** Checks for updates on a particular Farmware plugin when given the name of
     * a farmware. `updateFarmware("take-photo")`
     */
    Farmbot.prototype.updateFarmware = function (pkg) {
        return this.send(util_1.rpcRequest([{
                kind: "update_farmware",
                args: { package: pkg }
            }]));
    };
    /** Uninstall a Farmware plugin. */
    Farmbot.prototype.removeFarmware = function (pkg) {
        return this.send(util_1.rpcRequest([{
                kind: "remove_farmware",
                args: { package: pkg }
            }]));
    };
    /** Installs "Farmwares" (plugins) authored by FarmBot.io
   * onto the bot's SD card.
   */
    Farmbot.prototype.installFirstPartyFarmware = function () {
        return this.send(util_1.rpcRequest([{
                kind: "install_first_party_farmware",
                args: {}
            }]));
    };
    /** Deactivate FarmBot OS completely. */
    Farmbot.prototype.powerOff = function () {
        return this.send(util_1.rpcRequest([{ kind: "power_off", args: {} }]));
    };
    /** Cycle device power. */
    Farmbot.prototype.reboot = function () {
        return this.send(util_1.rpcRequest([{ kind: "reboot", args: {} }]));
    };
    /** Check for new versions of FarmBot OS. */
    Farmbot.prototype.checkUpdates = function () {
        return this.send(util_1.rpcRequest([
            { kind: "check_updates", args: { package: "farmbot_os" } }
        ]));
    };
    /** THIS WILL RESET THE SD CARD! Be careful!! */
    Farmbot.prototype.resetOS = function () {
        this.publish(util_1.rpcRequest([
            { kind: "factory_reset", args: { package: "farmbot_os" } }
        ]));
    };
    Farmbot.prototype.resetMCU = function () {
        return this.send(util_1.rpcRequest([
            { kind: "factory_reset", args: { package: "arduino_firmware" } }
        ]));
    };
    /** Lock the bot from moving. This also will pause running regimens and cause
     *  any running sequences to exit */
    Farmbot.prototype.emergencyLock = function () {
        return this.send(util_1.rpcRequest([{ kind: "emergency_lock", args: {} }]));
    };
    /** Unlock the bot when the user says it is safe. Currently experiencing
     * issues. Consider reboot() instead. */
    Farmbot.prototype.emergencyUnlock = function () {
        return this.send(util_1.rpcRequest([{ kind: "emergency_unlock", args: {} }]));
    };
    /** Execute a sequence by its ID on the API. */
    Farmbot.prototype.execSequence = function (sequence_id) {
        return this.send(util_1.rpcRequest([{ kind: "execute", args: { sequence_id: sequence_id } }]));
    };
    /** Run a preloaded Farmware / script on the SD Card. */
    Farmbot.prototype.execScript = function (/** Filename of the script */ label, 
    /** Optional ENV vars to pass the script */
    envVars) {
        return this.send(util_1.rpcRequest([
            { kind: "execute_script", args: { label: label }, body: envVars }
        ]));
    };
    /** Bring a particular axis (or all of them) to position 0. */
    Farmbot.prototype.home = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "home", args: args }]));
    };
    /** Use end stops or encoders to figure out where 0,0,0 is.
     *  WON'T WORK WITHOUT ENCODERS OR END STOPS! */
    Farmbot.prototype.findHome = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "find_home", args: args }]));
    };
    /** Move gantry to an absolute point. */
    Farmbot.prototype.moveAbsolute = function (args) {
        var x = args.x, y = args.y, z = args.z, speed = args.speed;
        speed = speed || config_1.CONFIG_DEFAULTS.speed;
        return this.send(util_1.rpcRequest([
            {
                kind: "move_absolute",
                args: {
                    location: util_1.coordinate(x, y, z),
                    offset: util_1.coordinate(0, 0, 0),
                    speed: speed
                }
            }
        ]));
    };
    /** Move gantry to position relative to its current position. */
    Farmbot.prototype.moveRelative = function (args) {
        var x = args.x, y = args.y, z = args.z, speed = args.speed;
        speed = speed || config_1.CONFIG_DEFAULTS.speed;
        return this.send(util_1.rpcRequest([{ kind: "move_relative", args: { x: x, y: y, z: z, speed: speed } }]));
    };
    /** Set a GPIO pin to a particular value. */
    Farmbot.prototype.writePin = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "write_pin", args: args }]));
    };
    /** Set a GPIO pin to a particular value. */
    Farmbot.prototype.readPin = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "read_pin", args: args }]));
    };
    /** Reverse the value of a digital pin. */
    Farmbot.prototype.togglePin = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "toggle_pin", args: args }]));
    };
    /** Read the status of the bot. Should not be needed unless you are first
     * logging in to the device, since the device pushes new states out on
     * every update. */
    Farmbot.prototype.readStatus = function (args) {
        if (args === void 0) { args = {}; }
        return this.send(util_1.rpcRequest([{ kind: "read_status", args: args }]));
    };
    /** Snap a photo and send to the API for post processing. */
    Farmbot.prototype.takePhoto = function (args) {
        if (args === void 0) { args = {}; }
        return this.send(util_1.rpcRequest([{ kind: "take_photo", args: args }]));
    };
    /** Download all of the latest JSON resources (plants, account info...)
     * from the FarmBot API. */
    Farmbot.prototype.sync = function (args) {
        if (args === void 0) { args = {}; }
        return this.send(util_1.rpcRequest([{ kind: "sync", args: args }]));
    };
    /** Set the position of the given axis to 0 at the current position of said
     * axis. Example: Sending bot.setZero("x") at x: 255 will translate position
     * 255 to 0. */
    Farmbot.prototype.setZero = function (axis) {
        return this.send(util_1.rpcRequest([{
                kind: "zero",
                args: { axis: axis }
            }]));
    };
    /** Update the Arduino settings */
    Farmbot.prototype.updateMcu = function (update) {
        var body = [];
        Object
            .keys(update)
            .forEach(function (label) {
            var value = util_2.pick(update, label, "ERROR");
            body.push({
                kind: "config_update",
                args: { package: "arduino_firmware" },
                body: [{ kind: "pair", args: { value: value, label: label } }]
            });
        });
        return this.send(util_1.rpcRequest(body));
    };
    /** Set user ENV vars (usually used by 3rd party Farmware scripts).
     * Set value to `undefined` to unset. */
    Farmbot.prototype.setUserEnv = function (configs) {
        var body = Object
            .keys(configs)
            .map(function (label) {
            return {
                kind: "pair",
                args: { label: label, value: (configs[label] || exports.NULL) }
            };
        });
        return this.send(util_1.rpcRequest([{ kind: "set_user_env", args: {}, body: body }]));
    };
    Farmbot.prototype.registerGpio = function (input) {
        var sequence_id = input.sequence_id, pin_number = input.pin_number;
        var rpc = util_1.rpcRequest([{
                kind: "register_gpio",
                args: { sequence_id: sequence_id, pin_number: pin_number }
            }]);
        return this.send(rpc);
    };
    Farmbot.prototype.unregisterGpio = function (input) {
        var pin_number = input.pin_number;
        var rpc = util_1.rpcRequest([{
                kind: "unregister_gpio",
                args: { pin_number: pin_number }
            }]);
        return this.send(rpc);
    };
    Farmbot.prototype.setServoAngle = function (args) {
        var result = this.send(util_1.rpcRequest([{ kind: "set_servo_angle", args: args }]));
        // Celery script can't validate `pin_number` and `pin_value` the way we need
        // for `set_servo_angle`. We will send the RPC command off, but also
        // crash the client to aid debugging.
        if (![4, 5].includes(args.pin_number)) {
            throw new Error("Servos only work on pins 4 and 5");
        }
        if (args.pin_value > 360 || args.pin_value < 0) {
            throw new Error("Pin value outside of 0...360 range");
        }
        return result;
    };
    /** Update a config option for FarmBot OS. */
    Farmbot.prototype.updateConfig = function (update) {
        var body = Object
            .keys(update)
            .map(function (label) {
            var value = util_2.pick(update, label, "ERROR");
            return { kind: "pair", args: { value: value, label: label } };
        });
        return this.send(util_1.rpcRequest([{
                kind: "config_update",
                args: { package: "farmbot_os" },
                body: body
            }]));
    };
    Farmbot.prototype.calibrate = function (args) {
        return this.send(util_1.rpcRequest([{ kind: "calibrate", args: args }]));
    };
    /** Tell the bot to send diagnostic info to the API.*/
    Farmbot.prototype.dumpInfo = function () {
        return this.send(util_1.rpcRequest([{
                kind: "dump_info",
                args: {}
            }]));
    };
    /** Retrieves all of the event handlers for a particular event.
     * Returns an empty array if the event did not exist.
      */
    Farmbot.prototype.event = function (name) {
        this._events[name] = this._events[name] || [];
        return this._events[name];
    };
    Farmbot.prototype.emit = function (event, data) {
        [this.event(event), this.event("*")]
            .forEach(function (handlers) {
            handlers.forEach(function (handler) {
                try {
                    handler(data, event);
                }
                catch (e) {
                    console.warn("Exception thrown while handling `" + event + "` event.");
                    console.dir(e);
                }
            });
        });
    };
    Object.defineProperty(Farmbot.prototype, "channel", {
        /** Dictionary of all relevant MQTT channels the bot uses. */
        get: function () {
            var deviceName = this.config.mqttUsername;
            return {
                /** From the browser, usually. */
                toDevice: "bot/" + deviceName + "/from_clients",
                /** From farmbot */
                toClient: "bot/" + deviceName + "/from_device",
                status: "bot/" + deviceName + "/status",
                sync: "bot/" + deviceName + "/sync/#",
                logs: "bot/" + deviceName + "/logs"
            };
        },
        enumerable: true,
        configurable: true
    });
    /** Low level means of sending MQTT packets. Does not check format. Does not
     * acknowledge confirmation. Probably not the one you want. */
    Farmbot.prototype.publish = function (msg, important) {
        if (important === void 0) { important = true; }
        if (this.client) {
            this.emit("sent", msg);
            /** SEE: https://github.com/mqttjs/MQTT.js#client */
            this.client.publish(this.channel.toDevice, JSON.stringify(msg));
        }
        else {
            if (important) {
                throw new Error("Not connected to server");
            }
        }
    };
    /** Low level means of sending MQTT RPC commands to the bot. Acknowledges
     * receipt of message, but does not check formatting. Consider using higher
     * level methods like .moveRelative(), .calibrate(), etc....
    */
    Farmbot.prototype.send = function (input) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.publish(input);
            that.on(input.args.label, function (response) {
                switch (response.kind) {
                    case "rpc_ok": return resolve(response);
                    case "rpc_error":
                        var reason = (response.body || []).map(function (x) { return x.args.message; }).join(", ");
                        return reject(new Error("Problem sending RPC command: " + reason));
                    default:
                        console.dir(response);
                        throw new Error("Got a bad CeleryScript node.");
                }
            });
        });
    };
    /** Main entry point for all MQTT packets. */
    Farmbot.prototype._onmessage = function (chan, buffer) {
        try {
            /** UNSAFE CODE: TODO: Add user defined type guards? */
            var msg = JSON.parse(buffer.toString());
        }
        catch (error) {
            throw new Error("Could not parse inbound message from MQTT.");
        }
        switch (chan) {
            case this.channel.logs: return this.emit("logs", msg);
            case this.channel.status: return this.emit("status", msg);
            case this.channel.toClient:
                if (util_2.isCeleryScript(msg)) {
                    return this.emit(msg.args.label, msg);
                }
                else {
                    console.warn("Got malformed message. Out of date firmware?");
                    return this.emit("malformed", msg);
                }
            default:
                if (chan.includes("sync")) {
                    this.emit("sync", msg);
                }
                else {
                    console.info("Unhandled inbound message from " + chan);
                }
        }
    };
    /** Bootstrap the device onto the MQTT broker. */
    Farmbot.prototype.connect = function () {
        var _this = this;
        var that = this;
        var _a = that.config, mqttUsername = _a.mqttUsername, token = _a.token, mqttServer = _a.mqttServer;
        that.client = mqtt_1.connect(mqttServer, {
            username: mqttUsername,
            password: token,
            clean: true,
            clientId: "FBJS-" + Farmbot.VERSION + "-" + util_1.uuid(),
            reconnectPeriod: RECONNECT_THROTTLE
        });
        that.client.subscribe(that.channel.toClient);
        that.client.subscribe(that.channel.logs);
        that.client.subscribe(that.channel.status);
        that.client.subscribe(that.channel.sync);
        that.client.on("message", that._onmessage.bind(that));
        that.client.on("offline", function () { return _this.emit("offline", {}); });
        that.client.on("connect", function () { return _this.emit("online", {}); });
        return new Promise(function (resolve, _reject) {
            var client = that.client;
            if (client) {
                client.once("connect", function () { return resolve(that); });
            }
            else {
                throw new Error("Please connect first.");
            }
        });
    };
    Farmbot.VERSION = "6.0.1";
    return Farmbot;
}());
exports.Farmbot = Farmbot;
