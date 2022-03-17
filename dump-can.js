#!/usr/bin/env node

const cli = require('commander');
const Panda = require('./lib').default;
const wait = require('./src/delay');
const package = require('./package');

cli
  .version(package.version)
  .description('Dump data from connected Panda over either USB or wifi. Uses pandajs under the hood.')
  .option('-w, --wifi', 'Connect to Panda over wifi instead of USB')
  .option('-a, --all', 'Print every message instead of just summaries (VERY spammy, one message per line JSON encoded)')
  .option('-n, --no-health', 'Don\'t print startup/connection messages (useful with --all and output redirection)')
  .option('-e, --no-errors', 'Don\'t print errors either')
  .option('-i, --index <i>', 'Choose a different connected panda than the first one (zero indexed)', parseInt)
  .parse(process.argv);

const panda = new Panda({
  wifi: cli.wifi,
  selectDevice: (devices) => {
    return devices[Math.min(devices.length, cli.index || 0)];
  }
});

panda.onMessage(function (msg) {
  if (cli.all) {
    msg.forEach((m) => console.log(JSON.stringify(m, function(k, v) {
      if (!k) {
        return v;
      }
      if (k === 'data' && v.type === 'Buffer') {
        return v.data;
        // return '0x' + Buffer.from(v.data).toString('hex');
      }
      return v;
    })));
  } else {
    console.log('Message count:', msg.length);
    console.log('First message CAN count:', msg[0].canMessages.length);
    console.log('First CAN message:', msg[0].canMessages[0]);
  }
});

panda.onError(function (err) {
  if (cli.errors) {
    console.error('Error:', err);
    process.exit(1);
  }
});

if (cli.health) {
  panda.onConnect(function (data) {
    console.log('Connected:', data);
  });
  panda.onDisconnect(function (data) {
    console.log('Disconnected:', data);
  });
}

connectAndRun();

async function connectAndRun () {
  await panda.connect();
  if (cli.health) {
    const health = await panda.getHealth();
    console.log(health);
    console.log('Connect finished, waiting then reading all messages...');
    await wait(1000);
    console.log('Start reading...');
  }
  panda.unpause();
}
