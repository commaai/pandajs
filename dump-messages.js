const Panda = require('./lib').default;
const wait = require('es6-sleep').promise;

var panda = new Panda({
  selectDevice: selectDevice
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
