'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _canMessage = require('can-message');

var _weakmapEvent = require('weakmap-event');

var _weakmapEvent2 = _interopRequireDefault(_weakmapEvent);

var _ap = require('ap');

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _thyming = require('thyming');

var _es6Sleep = require('es6-sleep');

var _pandaUsb = require('./panda-usb');

var _pandaUsb2 = _interopRequireDefault(_pandaUsb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// how many messages to batch at maximum when reading as fast as we can
var MAX_MESSAGE_QUEUE = 5000;

var MessageEvent = (0, _weakmapEvent2.default)();
var ErrorEvent = (0, _weakmapEvent2.default)();
var ConnectEvent = (0, _weakmapEvent2.default)();
var DisconnectEvent = (0, _weakmapEvent2.default)();

var Panda = function () {
  function Panda(options) {
    (0, _classCallCheck3.default)(this, Panda);

    options = options || {};

    options.selectDevice = options.selectDevice || selectFirstDevice;

    // setup event handlers
    this.onMessage = (0, _ap.partial)(MessageEvent.listen, this);
    this.onError = (0, _ap.partial)(ErrorEvent.listen, this);
    this.onConnect = (0, _ap.partial)(ConnectEvent.listen, this);
    this.onDisconnect = (0, _ap.partial)(DisconnectEvent.listen, this);

    // initialize device object
    this.device = (0, _pandaUsb2.default)(options);
    this.device.onError((0, _ap.partial)(ErrorEvent.broadcast, this));
    this.device.onConnect(this.connectHandler.bind(this));
    this.device.onDisconnect(this.disconnectHandler.bind(this));

    // member variables
    this.paused = true;
    this.messageQueue = [];

    // function binding
    this.readLoop = this.readLoop.bind(this);
    this.flushMessageQueue = this.flushMessageQueue.bind(this);
  }

  // state getters


  (0, _createClass3.default)(Panda, [{
    key: 'isConnected',
    value: function isConnected() {
      return !!this.connected;
    }
  }, {
    key: 'isPaused',
    value: function isPaused() {
      return !!this.paused;
    }

    // methods

  }, {
    key: 'connect',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.isConnected()) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', this.connected);

              case 2:
                return _context.abrupt('return', this.device.connect());

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connect() {
        return _ref.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: 'disconnect',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.isConnected()) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return', false);

              case 2:
                return _context2.abrupt('return', this.device.disconnect());

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function disconnect() {
        return _ref2.apply(this, arguments);
      }

      return disconnect;
    }()
  }, {
    key: 'start',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.connect();

              case 2:
                return _context3.abrupt('return', this.unpause());

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function start() {
        return _ref3.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: 'pause',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var wasPaused;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                wasPaused = this.isPaused();

                this.paused = true;

                return _context4.abrupt('return', !wasPaused);

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function pause() {
        return _ref4.apply(this, arguments);
      }

      return pause;
    }()
  }, {
    key: 'resume',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt('return', this.unpause());

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function resume() {
        return _ref5.apply(this, arguments);
      }

      return resume;
    }()
  }, {
    key: 'unpause',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var wasPaused;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                wasPaused = this.isPaused();

                if (wasPaused) {
                  _context6.next = 3;
                  break;
                }

                return _context6.abrupt('return', false);

              case 3:

                this.paused = false;
                this.startReading();

                return _context6.abrupt('return', wasPaused);

              case 6:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function unpause() {
        return _ref6.apply(this, arguments);
      }

      return unpause;
    }()
  }, {
    key: 'health',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var controlParams, result, buf, voltage, current, isStarted, controlsAreAllowed, isGasInterceptorDetector, isStartSignalDetected, isStartedAlt;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                controlParams = {
                  request: 0xd2,
                  value: 0,
                  index: 0
                };
                _context7.prev = 1;
                _context7.next = 4;
                return this.device.vendorRequest(controlParams, 13);

              case 4:
                result = _context7.sent;
                buf = result.data;
                voltage = buf.readUInt32LE(0);
                current = buf.readUInt32LE(4);
                isStarted = buf.readInt8(8) === 1;
                controlsAreAllowed = buf.readInt8(9) === 1;
                isGasInterceptorDetector = buf.readInt8(10) === 1;
                isStartSignalDetected = buf.readInt8(11) === 1;
                isStartedAlt = buf.readInt8(12) === 1;
                return _context7.abrupt('return', {
                  voltage: voltage,
                  current: current,
                  isStarted: isStarted,
                  controlsAreAllowed: controlsAreAllowed,
                  isGasInterceptorDetector: isGasInterceptorDetector,
                  isStartSignalDetected: isStartSignalDetected,
                  isStartedAlt: isStartedAlt
                });

              case 16:
                _context7.prev = 16;
                _context7.t0 = _context7['catch'](1);

                ErrorEvent.broadcast(this, { event: 'Panda.health failed', error: _context7.t0 });

              case 19:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[1, 16]]);
      }));

      function health() {
        return _ref7.apply(this, arguments);
      }

      return health;
    }()

    // event handlers

  }, {
    key: 'connectHandler',
    value: function connectHandler(usbId) {
      this.connected = usbId;
      ConnectEvent.broadcast(this, usbId);
    }
  }, {
    key: 'disconnectHandler',
    value: function disconnectHandler() {
      this.connected = false;
      this.paused = true;
      DisconnectEvent.broadcast(this, usbId);
    }

    // message queueing and flushing

  }, {
    key: 'needsFlushMessageQueue',
    value: function needsFlushMessageQueue() {
      var _this = this;

      this.needsFlush = true;
      if (this.flushEvent) {
        return this.flushEvent;
      }

      var unlisten = (0, _raf2.default)(this.flushMessageQueue);

      this.flushEvent = function () {
        _raf2.default.cancel(unlisten);
        _this.flushEvent = false;
      };

      return this.flushEvent;
    }
  }, {
    key: 'flushMessageQueue',
    value: function flushMessageQueue() {
      this.flushEvent();

      if (this.needsFlush && this.messageQueue.length) {
        var messageQueue = this.messageQueue;
        this.messageQueue = [];
        this.needsFlush = false;
        MessageEvent.broadcast(this, messageQueue);
      }
    }
    // internal reading loop

  }, {
    key: 'startReading',
    value: function startReading() {
      if (this.isReading) {
        return true;
      }
      if (this.isPaused()) {
        return false;
      }

      // start loop!
      this.isReading = true;
      this.readLoop();
    }
  }, {
    key: 'readLoop',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        var i, data, receiptTime, canMessages;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!this.isPaused()) {
                  _context8.next = 3;
                  break;
                }

                this.isReading = false;
                return _context8.abrupt('return', false);

              case 3:
                this.isReading = true;

                i = 0;

              case 5:
                if (!(i < MAX_MESSAGE_QUEUE)) {
                  _context8.next = 20;
                  break;
                }

                _context8.next = 8;
                return this.device.nextMessage();

              case 8:
                data = _context8.sent;
                receiptTime = (0, _performanceNow2.default)() / 1000;
                canMessages = (0, _canMessage.unpackCAN)(data);

                if (canMessages.length) {
                  _context8.next = 15;
                  break;
                }

                _context8.next = 14;
                return (0, _es6Sleep.promise)(1);

              case 14:
                return _context8.abrupt('continue', 17);

              case 15:
                this.messageQueue.push({
                  time: receiptTime,
                  canMessages: canMessages
                });
                this.needsFlushMessageQueue();

              case 17:
                ++i;
                _context8.next = 5;
                break;

              case 20:
                this.needsFlushMessageQueue();

                // repeat!
                (0, _thyming.timeout)(this.readLoop);

              case 22:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function readLoop() {
        return _ref8.apply(this, arguments);
      }

      return readLoop;
    }()
  }]);
  return Panda;
}();

exports.default = Panda;


function selectFirstDevice(devices) {
  return devices[0];
}