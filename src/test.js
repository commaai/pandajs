import PandaJS from './';

test('is valid', () => {
  expect(new PandaJS());
});

test('manages connection state correctly, starts paused', async function() {
  var panda = new PandaJS();

  var usbId = await panda.connect();
  expect(usbId);
  expect(panda.isConnected()).toEqual(true);
  expect(panda.isPaused()).toEqual(true);

  await panda.disconnect();
  expect(panda.isConnected()).toEqual(false);
});


test('re-pauses when disconnected', async function() {
  var panda = new PandaJS();

  var usbId = await panda.start();
  expect(usbId);
  expect(panda.isConnected()).toEqual(true);
  expect(panda.isPaused()).toEqual(false);

  await panda.disconnect();
  expect(panda.isConnected()).toEqual(false);
  expect(panda.isPaused()).toEqual(true);
  await panda.connect();
  expect(panda.isConnected()).toEqual(true);
  expect(panda.isPaused()).toEqual(true);
});
