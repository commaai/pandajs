'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _canMessage = require('can-message');

var _weakmapEvent = require('weakmap-event');

var _weakmapEvent2 = _interopRequireDefault(_weakmapEvent);

var _ap = require('ap');

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _wait = require('./wait');

var _wait2 = _interopRequireDefault(_wait);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PANDA_VENDOR_ID = 0xbbaa;
//const PANDA_PRODUCT_ID = 0xddcc;

var BUFFER_SIZE = 0x10 * 256;

var ErrorEvent = (0, _weakmapEvent2.default)();
var ConnectEvent = (0, _weakmapEvent2.default)();
var DisconnectEvent = (0, _weakmapEvent2.default)();

var Panda = function () {
  function Panda() {
    _classCallCheck(this, Panda);

    this.device = null;
    this.onError = (0, _ap.partial)(ErrorEvent.listen, this);
    this.onConnect = (0, _ap.partial)(ConnectEvent.listen, this);
    this.onDisconnect = (0, _ap.partial)(DisconnectEvent.listen, this);
  }

  _createClass(Panda, [{
    key: 'connect',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return navigator.usb.requestDevice({ filters: [{ vendorId: PANDA_VENDOR_ID }] });

              case 2:
                this.device = _context.sent;
                _context.next = 5;
                return this.device.open();

              case 5:
                _context.next = 7;
                return this.device.selectConfiguration(1);

              case 7:
                _context.next = 9;
                return this.device.claimInterface(0);

              case 9:
                return _context.abrupt('return', this.device.serialNumber);

              case 10:
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.device) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return', false);

              case 2:
                _context2.next = 4;
                return this.device.close();

              case 4:
                this.device = null;

                return _context2.abrupt('return', true);

              case 6:
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
    key: 'health',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var controlParams, buf, voltage, current, isStarted, controlsAreAllowed, isGasInterceptorDetector, isStartSignalDetected, isStartedAlt;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                controlParams = {
                  requestType: 'vendor',
                  recipient: 'device',
                  request: 0xd2,
                  value: 0,
                  index: 0
                };
                _context3.prev = 1;
                _context3.next = 4;
                return this.device.controlTransferIn(controlParams, 13);

              case 4:
                buf = _context3.sent;
                voltage = buf.readUInt32LE(0);
                current = buf.readUInt32LE(4);
                isStarted = buf.readInt8(8) === 1;
                controlsAreAllowed = buf.readInt8(9) === 1;
                isGasInterceptorDetector = buf.readInt8(10) === 1;
                isStartSignalDetected = buf.readInt8(11) === 1;
                isStartedAlt = buf.readInt8(12) === 1;
                return _context3.abrupt('return', {
                  voltage: voltage,
                  current: current,
                  isStarted: isStarted,
                  controlsAreAllowed: controlsAreAllowed,
                  isGasInterceptorDetector: isGasInterceptorDetector,
                  isStartSignalDetected: isStartSignalDetected,
                  isStartedAlt: isStartedAlt
                });

              case 15:
                _context3.prev = 15;
                _context3.t0 = _context3['catch'](1);

                ErrorEvent.broadcast(this, { event: 'Panda.health failed', error: _context3.t0 });

              case 18:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 15]]);
      }));

      function health() {
        return _ref3.apply(this, arguments);
      }

      return health;
    }()

    // not used anymore, but is nice for reference

  }, {
    key: 'nextFakeMessage',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _wait2.default)(10);

              case 2:
                return _context4.abrupt('return', (0, _canMessage.packCAN)({
                  address: 0,
                  busTime: ~~(Math.random() * 65000),
                  data: ''.padEnd(16, '0'),
                  bus: 0
                }));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function nextFakeMessage() {
        return _ref4.apply(this, arguments);
      }

      return nextFakeMessage;
    }()
  }, {
    key: 'nextMessage',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var result, attempts;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                result = null;
                attempts = 0;

              case 2:
                if (!(result === null)) {
                  _context5.next = 17;
                  break;
                }

                _context5.prev = 3;
                _context5.next = 6;
                return this.device.transferIn(1, BUFFER_SIZE);

              case 6:
                result = _context5.sent;
                _context5.next = 15;
                break;

              case 9:
                _context5.prev = 9;
                _context5.t0 = _context5['catch'](3);

                console.warn('can_recv failed, retrying');
                attempts = Math.min(++attempts, 10);
                _context5.next = 15;
                return (0, _wait2.default)(attempts * 100);

              case 15:
                _context5.next = 2;
                break;

              case 17:
                return _context5.abrupt('return', result.data.buffer);

              case 18:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 9]]);
      }));

      function nextMessage() {
        return _ref5.apply(this, arguments);
      }

      return nextMessage;
    }()
  }]);

  return Panda;
}();

exports.default = Panda;