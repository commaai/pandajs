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

var _usb = require('usb');

var _usb2 = _interopRequireDefault(_usb);

var _canMessage = require('can-message');

var _weakmapEvent = require('weakmap-event');

var _weakmapEvent2 = _interopRequireDefault(_weakmapEvent);

var _ap = require('ap');

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _es6Sleep = require('es6-sleep');

var _isPromise = require('is-promise');

var _isPromise2 = _interopRequireDefault(_isPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PANDA_VENDOR_ID = 0xbbaa;
var PANDA_MESSAGE_ENDPOINT_NUMBER = 1;
// const PANDA_PRODUCT_ID = 0xddcc;

var BUFFER_SIZE = 0x10 * 256;

var ErrorEvent = (0, _weakmapEvent2.default)();
var ConnectEvent = (0, _weakmapEvent2.default)();
var DisconnectEvent = (0, _weakmapEvent2.default)();

var Panda = function () {
  function Panda(options) {
    (0, _classCallCheck3.default)(this, Panda);

    this.device = null;
    this.selectDeviceMethod = options.selectDevice;
    this.onError = (0, _ap.partial)(ErrorEvent.listen, this);
    this.onConnect = (0, _ap.partial)(ConnectEvent.listen, this);
    this.onDisconnect = (0, _ap.partial)(DisconnectEvent.listen, this);
  }

  (0, _createClass3.default)(Panda, [{
    key: 'findDevice',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var devices;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                devices = _usb2.default.getDeviceList();


                devices = devices.filter(function (device) {
                  return device.deviceDescriptor.idVendor === PANDA_VENDOR_ID;
                });

                return _context.abrupt('return', this.selectDevice(devices));

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function findDevice() {
        return _ref.apply(this, arguments);
      }

      return findDevice;
    }()
  }, {
    key: 'selectDevice',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(devices) {
        var _this = this;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', new Promise(function (resolve, reject) {
                  var result = _this.selectDeviceMethod(devices, resolve);

                  if (result) {
                    if ((0, _isPromise2.default)(result)) {
                      result.then(resolve).catch(reject);
                    } else {
                      resolve(result);
                    }
                  }
                }));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function selectDevice(_x) {
        return _ref2.apply(this, arguments);
      }

      return selectDevice;
    }()
  }, {
    key: 'setConfiguration',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(config) {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                  _this2.device.setConfiguration(1, function (err, result) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(result);
                  });
                }));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setConfiguration(_x2) {
        return _ref3.apply(this, arguments);
      }

      return setConfiguration;
    }()
  }, {
    key: 'getStringDescriptor',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(index) {
        var _this3 = this;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt('return', new Promise(function (resolve, reject) {
                  _this3.device.getStringDescriptor(index, function (err, buffer) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(buffer.toString());
                  });
                }));

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getStringDescriptor(_x3) {
        return _ref4.apply(this, arguments);
      }

      return getStringDescriptor;
    }()
  }, {
    key: 'connect',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var serialNumber;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.findDevice();

              case 2:
                this.device = _context5.sent;
                _context5.next = 5;
                return this.device.open(false);

              case 5:
                _context5.next = 7;
                return this.setConfiguration(1);

              case 7:
                _context5.next = 9;
                return this.device.interface(0).claim();

              case 9:
                _context5.next = 11;
                return this.getStringDescriptor(this.device.deviceDescriptor.iSerialNumber);

              case 11:
                serialNumber = _context5.sent;

                ConnectEvent.broadcast(this, serialNumber);

                return _context5.abrupt('return', serialNumber);

              case 14:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function connect() {
        return _ref5.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: 'disconnect',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.device) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return', false);

              case 2:
                _context6.next = 4;
                return this.device.close();

              case 4:
                this.device = null;

                return _context6.abrupt('return', true);

              case 6:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function disconnect() {
        return _ref6.apply(this, arguments);
      }

      return disconnect;
    }()
  }, {
    key: 'vendorRequest',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(data, length) {
        var _this4 = this;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', new Promise(function (resolve, reject) {
                  // data is request, value, index
                  var flags = _usb2.default.LIBUSB_RECIPIENT_DEVICE | _usb2.default.LIBUSB_REQUEST_TYPE_VENDOR | _usb2.default.LIBUSB_ENDPOINT_IN;

                  _this4.device.controlTransfer(flags, data.request, data.value, data.index, length, function (err, data) {
                    if (err) {
                      return reject(err);
                    }

                    resolve({
                      data: Buffer.from(data),
                      status: "ok" // hack, find out when it's actually ok
                    });
                  });
                }));

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function vendorRequest(_x4, _x5) {
        return _ref7.apply(this, arguments);
      }

      return vendorRequest;
    }()

    // not used anymore, but is nice for reference

  }, {
    key: 'nextFakeMessage',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return (0, _es6Sleep.promise)(10);

              case 2:
                return _context8.abrupt('return', (0, _canMessage.packCAN)({
                  address: 0,
                  busTime: ~~(Math.random() * 65000),
                  data: ''.padEnd(16, '0'),
                  bus: 0
                }));

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function nextFakeMessage() {
        return _ref8.apply(this, arguments);
      }

      return nextFakeMessage;
    }()
  }, {
    key: 'transferIn',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(endpointNumber, length) {
        var _this5 = this;

        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                // in endpoints are on another address scope, so we or in 0x80 to get 0x81
                endpointNumber = endpointNumber | 0x80;

                return _context10.abrupt('return', new Promise(function () {
                  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(resolve, reject) {
                    var endpoint, err, _err, data;

                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            endpoint = null;

                            _this5.device.interfaces.some(function (iface) {
                              var epoint = iface.endpoint(endpointNumber);

                              if (epoint) {
                                endpoint = epoint;
                                return true;
                              }
                            });

                            if (endpoint) {
                              _context9.next = 6;
                              break;
                            }

                            err = new Error('PandaJS: nodeusb: transferIn failed to find endpoint interface ' + endpointNumber);

                            ErrorEvent.broadcast(_this5, err);
                            return _context9.abrupt('return', reject(err));

                          case 6:
                            if (!(endpoint.direction !== 'in')) {
                              _context9.next = 10;
                              break;
                            }

                            _err = new Error('PandaJS: nodeusb: endpoint interface is ' + endpoint.direction + ' instead of in');

                            ErrorEvent.broadcast(_this5, _err);
                            return _context9.abrupt('return', reject(_err));

                          case 10:
                            data = Buffer.from([]);

                          case 11:
                            if (!(data.length === 0)) {
                              _context9.next = 17;
                              break;
                            }

                            _context9.next = 14;
                            return _this5.endpointTransfer(endpoint, length);

                          case 14:
                            data = _context9.sent;
                            _context9.next = 11;
                            break;

                          case 17:
                            resolve(data);

                          case 18:
                          case 'end':
                            return _context9.stop();
                        }
                      }
                    }, _callee9, _this5);
                  }));

                  return function (_x8, _x9) {
                    return _ref10.apply(this, arguments);
                  };
                }()));

              case 2:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function transferIn(_x6, _x7) {
        return _ref9.apply(this, arguments);
      }

      return transferIn;
    }()
  }, {
    key: 'endpointTransfer',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(endpoint, length) {
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt('return', new Promise(function (resolve, reject) {
                  endpoint.transfer(length, function (err, data) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(data);
                  });
                }));

              case 1:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function endpointTransfer(_x10, _x11) {
        return _ref11.apply(this, arguments);
      }

      return endpointTransfer;
    }()
  }, {
    key: 'nextMessage',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
        var result, attempts;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                result = null;
                attempts = 0;

              case 2:
                if (!(result === null)) {
                  _context12.next = 18;
                  break;
                }

                _context12.prev = 3;
                _context12.next = 6;
                return this.transferIn(1, BUFFER_SIZE);

              case 6:
                return _context12.abrupt('return', _context12.sent);

              case 9:
                _context12.prev = 9;
                _context12.t0 = _context12['catch'](3);

                console.log(_context12.t0);
                console.warn('can_recv failed, retrying');
                attempts = Math.min(++attempts, 10);
                _context12.next = 16;
                return (0, _es6Sleep.promise)(attempts * 100);

              case 16:
                _context12.next = 2;
                break;

              case 18:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[3, 9]]);
      }));

      function nextMessage() {
        return _ref12.apply(this, arguments);
      }

      return nextMessage;
    }()
  }]);
  return Panda;
}();

exports.default = Panda;