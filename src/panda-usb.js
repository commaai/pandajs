
export default function PandaUSB (options) {
  if (require('is-browser')) {
    let PandaWebUSB = require('./impl/browser');
    return new PandaWebUSB(options, navigator.usb);
  }
  // check for test before node since tests always run in node
  if (isTestEnv()) {
    let PandaMock = require('./impl/mock');
    return new PandaMock(options);
  }
  if (require('is-node')) {
    let PandaNodeUSB = require('./impl/node');
    return new PandaNodeUSB(options);
  }
  console.log(process.env);
  throw new Error('pandajs.PandaUSB: Unable to connect to any usb devices, unsupported environment.');
}

function isTestEnv () {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }
  if (process.env.npm_lifecycle_event === 'test') {
    return true;
  }
  return false;
}
