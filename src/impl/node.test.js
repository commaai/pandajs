import PandaNode from './node';
import test from 'tape';
import { promise as wait } from 'es6-sleep';
import { partial } from 'ap';

const desiredDeviceIndex = 2;
const desiredDeviceString = 'it worked';
const deviceList = [false, false, desiredDeviceString, false];

test('selectDevice can return any way', async function (t) {
  var panda = new PandaNode({
    selectDevice: selectDeviceReturn
  });
  t.equals(await panda.selectDevice(deviceList), desiredDeviceString, 'works when returning directly');

  panda = new PandaNode({
    selectDevice: selectDevicePromise
  });
  t.equals(await panda.selectDevice(deviceList), desiredDeviceString, 'works when using promises');

  panda = new PandaNode({
    selectDevice: selectDeviceCallback
  });
  t.equals(await panda.selectDevice(deviceList), desiredDeviceString, 'works when using callback');

  t.end();
});

function selectDeviceReturn (devices) {
  return devices[desiredDeviceIndex];
}

async function selectDevicePromise (devices) {
  await wait(100);
  return devices[desiredDeviceIndex];
}

function selectDeviceCallback (devices, callback) {
  wait(100).then(partial(callback, devices[desiredDeviceIndex]));
}
