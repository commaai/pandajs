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

var _es6Sleep = require('es6-sleep');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PANDA_VENDOR_ID = 0xbbaa;
//const PANDA_PRODUCT_ID = 0xddcc;

var BUFFER_SIZE = 0x10 * 256;

var ErrorEvent = (0, _weakmapEvent2.default)();
var ConnectEvent = (0, _weakmapEvent2.default)();
var DisconnectEvent = (0, _weakmapEvent2.default)();

var Panda = function () {
  function Panda(options, usb) {
    (0, _classCallCheck3.default)(this, Panda);

    this.usb = usb;
    this.device = null;
    this.onError = (0, _ap.partial)(ErrorEvent.listen, this);
    this.onConnect = (0, _ap.partial)(ConnectEvent.listen, this);
    this.onDisconnect = (0, _ap.partial)(DisconnectEvent.listen, this);
  }

  (0, _createClass3.default)(Panda, [{
    key: 'connect',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.usb.requestDevice({
                  filters: [{ vendorId: PANDA_VENDOR_ID }]
                });

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

                ConnectEvent.broadcast(this, this.device.serialNumber);

                return _context.abrupt('return', this.device.serialNumber);

              case 11:
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
    key: 'vendorRequest',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(data, length) {
        var controlParams, result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // data is request, value, index
                controlParams = {
                  requestType: 'vendor',
                  recipient: 'device',
                  request: data.request,
                  value: data.value,
                  index: data.index
                };
                _context3.next = 3;
                return this.device.controlTransferIn(controlParams, length);

              case 3:
                result = _context3.sent;

                result.data = Buffer.from(result.data.buffer);
                return _context3.abrupt('return', result);

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function vendorRequest(_x, _x2) {
        return _ref3.apply(this, arguments);
      }

      return vendorRequest;
    }()

    // not used anymore, but is nice for reference

  }, {
    key: 'nextFakeMessage',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _es6Sleep.promise)(10);

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
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var result, attempts;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
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
                return (0, _es6Sleep.promise)(attempts * 100);

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