#!/usr/bin/env node

const cli = require('commander');
const PandaLib = require('./lib');
const Panda = PandaLib.default;
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
  .command('is-white')
  .description('Ask the connected Panda if it is a white Panda or not. Outputs "true" or "false"')
  .action(isWhite);
cli
  .command('is-grey')
  .description('Ask the connected Panda if it is a grey Panda or not. Outputs "true" or "false"')
  .action(isGrey);
cli
  .command('is-black')
  .description('Ask the connected Panda if it is a black Panda or not. Outputs "true" or "false"')
  .action(isBlack);
cli
  .command('has-obd')
  .description('Ask the connected Panda if it has an OBD port connection or not. Outputs "true" or "false"')
  .action(hasObd);
cli
  .command('obd <connected>')
  .description('Connect CAN bus 1 (zero-based numbering) to the OBD port (if supported and parameter is "true"')
  .action(setObd);
cli
  .command('safety <mode>')
  .description('Set the current safety mode')
  .action(setSafetyMode);

if (!process.argv.slice(2).length) {
  cli.help();
}

const safetyModes = [];
Object.keys(PandaLib).forEach(function (key) {
  if (key.startsWith('SAFETY_')) {
    safetyModes.push(key.substr(7).toLowerCase());
  }
});

cli.parse(process.argv);

async function setupPanda () {
  const panda = new Panda({
    wifi: cli.wifi
  });

  panda.onError(function (err) {
    if (cli.errors) {
      console.error('Error:', err);
      process.exit(1);
    }
  });

  await panda.connect();
  return panda;
}

// command implementations
async function getVersion () {
  const panda = await setupPanda();
  const result = await panda.getVersion();
  console.log(result);
}
async function getSecret () {
  const panda = await setupPanda();
  const result = await panda.getSecret();
  console.log(result);
}

async function isWhite () {
  const panda = await setupPanda();
  const result = await panda.isWhite();
  console.log('is white:', result);
}

async function isGrey () {
  const panda = await setupPanda();
  const result = await panda.isGrey();
  console.log('is grey:', result);
}

async function isBlack () {
  const panda = await setupPanda();
  const result = await panda.isBlack();
  console.log('is black:', result);
}

async function hasObd () {
  const panda = await setupPanda();
  const result = await panda.hasObd();
  console.log('has OBD port:', result);
}

async function setObd (connected, cmd) {
  if (connected !== "true" && connected !== "false" && connected !== "0" && connected !== "1") {
    console.error('Connected must be true or false');
    return;
  }
  obd = connected === "true" || connected === "1";
  console.log('OBD port:', obd ? 'connected' : 'disconnected');
  const panda = await setupPanda();
  const result = await panda.setObd(obd);
  console.log(result);
}

async function setSafetyMode (mode, cmd) {
  if (safetyModes.indexOf(mode) === -1) {
    console.error('Safety mode must be one of the following:', '\n\t' + safetyModes.join('\n\t'));
    return;
  }
  const modeConst = PandaLib['SAFETY_' + mode.toUpperCase()];
  console.log('Activing safety mode:', mode, '(0x' + modeConst.toString(16) + ')');
  const panda = await setupPanda();
  const result = await panda.setSafetyMode(modeConst);
  console.log(result);
}

async function getWifi () {
  const panda = await setupPanda();
  const result = await panda.getDeviceMetadata();
  console.log('SID: panda-' + result[0]);
  console.log('Password:', result[1]);
}

async function getHealth () {
  const panda = await setupPanda();
  console.log(await panda.getHealth());
}
