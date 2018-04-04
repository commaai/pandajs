#!/usr/bin/env node

const cli = require('commander');
const Panda = require('./lib').default;
const wait = require('./src/delay');

cli
  .option('-w, --wifi', 'Connect to Panda over wifi instead of USB')
  .parse(process.argv);

var panda = new Panda({
  selectDevice: selectDevice,
  wifi: cli.wifi
});

panda.onMessage(function (msg) {
  console.log('Message count:', msg.length);
  console.log('First message CAN count:', msg[0].canMessages.length);
  console.log('First CAN message:', msg[0].canMessages[0]);
});
panda.onError(function (err) {
  console.error('Error:', err);
  process.exit(1);
});
panda.onConnect(function (data) {
  console.log('Connected:', data);
});
panda.onDisconnect(function (data) {
  console.log('Disconnected:', data);
});

connectAndRun();

function selectDevice (devices, cb) {
  // console.log(devices);
  return devices[0];
}

async function connectAndRun () {
  await panda.connect();
  var health = await panda.health();
  console.log(health);
  console.log('Connect finished, waiting then reading all messages...');
  await wait(1000);
  console.log('Start reading...');
  panda.unpause();
}
