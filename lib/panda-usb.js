'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PandaUSB;

var _browser = require('./impl/browser');

var _browser2 = _interopRequireDefault(_browser);

var _node = require('./impl/node');

var _node2 = _interopRequireDefault(_node);

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PandaUSB(options) {
  if (require('is-browser')) {
    return new _browser2.default(options, navigator.usb);
  }
  // check for test before node since tests always run in node
  if (require('./is-test')) {
    return new _mock2.default(options);
  }
  if (require('is-node')) {
    return new _node2.default(options);
  }
  console.log(process.env);
  throw new Error('pandajs.PandaUSB: Unable to connect to any usb devices, unsupported environment.');
}