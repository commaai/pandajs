import PandaWebUSB from './impl/browser';
import PandaNodeUSB from './impl/node';
import PandaMock from './impl/mock';

export default function PandaUSB (options) {
  if (require('is-browser')) {
    return new PandaWebUSB(options, navigator.usb);
  }
  // check for test before node since tests always run in node
  if (isTestEnv()) {
    return new PandaMock(options);
  }
  if (require('is-node')) {
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
