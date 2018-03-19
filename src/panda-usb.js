import PandaBrowser from './browser';
import PandaMock from './mock';

export default function PandaUSB () {
  if (require('is-browser')) {
    return new PandaBrowser();
  }
  if (require('./is-test')) {
    return new PandaMock();
  }
  console.log(process.env);
  throw new Error('pandajs.PandaUSB: Unable to connect to any usb devices, unsupported environment.');
}
