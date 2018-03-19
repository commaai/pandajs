'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PandaUSB;

var _browser = require('./browser');

var _browser2 = _interopRequireDefault(_browser);

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PandaUSB() {
  if (require('is-browser')) {
    return new _browser2.default();
  }
  if (require('./is-test')) {
    return new _mock2.default();
  }
  console.log(process.env);
  throw new Error('pandajs.PandaUSB: Unable to connect to any usb devices, unsupported environment.');
}