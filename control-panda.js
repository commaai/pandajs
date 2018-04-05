#!/usr/bin/env node

const cli = require('commander');
const PandaLib = require('./lib');
const Panda = PandaLib.default;
const wait = require('./src/delay');
const package = require('./package');

cli
  .version(package.version)
  .description('Control various settings and modes of your Panda device')
  .option('-e, --no-errors', 'Don\'t print any errors')
  .option('-w, --wifi', 'Connect to Panda over wifi instead of USB');

cli
  .command('version')
  .description('Request the version number of the Panda unit')
  .action(getVersion);
cli
  .command('health')
  .description('Get health information from connected Panda device')
  .action(getHealth);
cli
  .command('secret')
  .description('Request the secret from the Panda device, this is also the wifi password')
  .action(getSecret);
cli
  .command('wifi')
  .description('Get wifi SID and password for the connected Panda device')
  .action(getWifi);
cli
  .command('is-grey')
  .description('Ask the connected Panda if it is a grey Panda or not. Outputs "true" or "false"')
  .action(isGrey);
cli
  .command('safety <mode>')
  .description('Set the current safety mode')
  .action(setSafetyMode);

if (!process.argv.slice(2).length) {
  cli.help();
}

var safetyModes = [];
Object.keys(PandaLib).forEach(function (key) {
  if (key.startsWith('SAFETY_')) {
    safetyModes.push(key.substr(7).toLowerCase());
  }
});

var panda = new Panda({
  wifi: cli.wifi
});

panda.onError(function (err) {
  if (cli.errors) {
    console.error('Error:', err);
    process.exit(1);
  }
});

// command implementations
async function getVersion () {
  await panda.connect();
  var result = await panda.getVersion();
  console.log(result);
}
async function getSecret () {
  await panda.connect();
  var result = await panda.getSecret();
  console.log(result);
}

async function isGrey () {
  await panda.connect();
  var result = await panda.isGrey();
  console.log(result);
}

async function setSafetyMode (mode, cmd) {
  if (safetyModes.indexOf(mode) === -1) {
    console.error('Safety mode must be one of the following:', '\n\t' + safetyModes.join('\n\t'));
    return;
  }
  var modeConst = PandaLib['SAFETY_' + mode.toUpperCase()];
  console.log('Activing safety mode:', mode, '(0x' + modeConst.toString(16) + ')');
  await panda.connect();
  var result = await panda.setSafetyMode(modeConst);
  console.log(result);
}

async function getWifi () {
  await panda.connect();
  var result = await panda.getDeviceMetadata();
  console.log('SID: panda-' + result[0]);
  console.log('Password:', result[1]);
}

async function getHealth () {
  await panda.connect();
  console.log(await panda.getHealth());
}

// parse after everything so that static code runs first
cli.parse(process.argv);
