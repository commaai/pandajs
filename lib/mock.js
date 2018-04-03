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

var _weakmapEvent = require('weakmap-event');

var _weakmapEvent2 = _interopRequireDefault(_weakmapEvent);

var _es6Sleep = require('es6-sleep');

var _ap = require('ap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorEvent = (0, _weakmapEvent2.default)(); // a mock interface for USB communications
// this is used by the test cases

var ConnectEvent = (0, _weakmapEvent2.default)();
var DisconnectEvent = (0, _weakmapEvent2.default)();

var MockPanda = function () {
  function MockPanda() {
    (0, _classCallCheck3.default)(this, MockPanda);

    this.onError = (0, _ap.partial)(ErrorEvent.listen, this);
    this.onConnect = (0, _ap.partial)(ConnectEvent.listen, this);
    this.onDisconnect = (0, _ap.partial)(DisconnectEvent.listen, this);
  }

  (0, _createClass3.default)(MockPanda, [{
    key: 'connect',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _es6Sleep.promise)(100);

              case 2:
                ConnectEvent.broadcast(this, '123345123');

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
                _context2.next = 2;
                return (0, _es6Sleep.promise)(100);

              case 2:
                DisconnectEvent.broadcast(this, '123345123');

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
    key: 'nextMessage',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(~~(Math.random() * 20) === 0)) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return (0, _es6Sleep.promise)(10);

              case 3:
                return _context3.abrupt('return', Buffer.from('ab'.repeat(16), 'hex'));

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function nextMessage() {
        return _ref3.apply(this, arguments);
      }

      return nextMessage;
    }()
  }]);
  return MockPanda;
}();

exports.default = MockPanda;