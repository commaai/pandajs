import PandaJS from './';
import test from 'tape';

test('is valid', (t) => {
  t.ok(new PandaJS());

  t.end();
});

test('manages connection state correctly, starts paused', async function(t) {
  var panda = new PandaJS();

  var usbId = await panda.connect();
  t.ok(usbId, 'gets a USB id from connect');
  t.equals(panda.isConnected(), true);
  t.equals(panda.isPaused(), true);

  await panda.disconnect();
  t.equals(panda.isConnected(), false);

  t.end();
});


test('re-pauses when disconnected', async function(t) {
  var panda = new PandaJS();

  var usbId = await panda.start();
  t.ok(usbId, 'gets a USB id from start');
  t.equals(panda.isConnected(), true, 'is connected state after connecting');
  t.equals(panda.isPaused(), false, 'starts unpaused when start is used');

  await panda.disconnect();
  t.equals(panda.isConnected(), false, 'is disconnected after disconnect');
  t.equals(panda.isPaused(), true, 'repauses after disconnect');
  await panda.connect();
  t.equals(panda.isConnected(), true, 'is connected after reconnect');
  t.equals(panda.isPaused(), true, 'starts paused when connect is used');

  t.end();
});
