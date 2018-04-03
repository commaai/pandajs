import PandaWebUSB from './impl/webusb';
import PandaNodeUSB from './impl/nodeusb';
import PandaMock from './mock';

export default function PandaUSB (options) {
  if (require('is-browser')) {
    return new PandaWebUSB(options, navigator.usb);
  }
  if (require('./is-test')) {
    return new PandaMock(options);
  }
  if (require('is-node')) {
    return new PandaNodeUSB(options);
  }
  console.log(process.env);
  throw new Error('pandajs.PandaUSB: Unable to connect to any usb devices, unsupported environment.');
}
