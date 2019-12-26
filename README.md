# PandaJS
Interract with your [panda OBD-II Dongle](https://shop.comma.ai/products/panda-obd-ii-dongle) from JavaScript.

Supports
 * [x] Browser
 * [x] Node
 * [ ] React Native

## Installation
`npm i --save @commaai/pandajs`

or

`yarn add @commaai/pandajs`

## Usage
```js
import Panda from '@commaai/pandajs';

// create instance
var panda = new Panda();

// register listener
panda.onMessage((msg) => {
  console.log(msg.address, msg.busTime, msg.data, msg.bus);
});

// start reading data
panda.start();

// pause data
panda.pause();

// resume reading data
panda.unpause();

// close connects and take everything down
panda.disconnect();
```

## API

#### `new Panda([options])` -> `Panda`
Creates a new Panda instance

* `options` (*optional* object)
  * `selectDevice`: (*optional* `function(devices, callback)`) A user defined function for selecting which available device to use, parameters are an array of discovered devices and a callback function. The method can either return the desired device, return a promise, or use the callback function. There is no timeout for this method, so make sure it eventually does one of those three things. *This option does nothing in browser mode since webusb has it's own UI for selecting the device.*
  * `wifi`: (*optional* `boolean`) Enables wifi mode, communicates with the panda device over an already established wifi connection with it. This option will throw errors if you enable it in browser mode.

### Methods
#### `Panda.connect()` -> `Promise: string`
Tell the Panda instance to connect to USB. Does not start reading messages until you call `start`. On success, returns the ID of the USB device found.

#### `Panda.disconnect()` -> `Promise: boolean`
Disconnect from the USB device and stop everything. Returns true if it was running before.

#### `Panda.start()` -> `Promise: string`
Tell the Panda instance to connect to USB if it's not already and start reading messages. On success, returns the ID of the USB device found.

This function is the same as running
```js
panda.connect()
  .then(() => panda.unpause());
```

#### `Panda.pause()` -> `boolean`
Pauses reading in messages from the active connection. Returns true only if the stream was not already paused. While paused messages will queue up on the Panda device, however this queue has a limited size so pausing may result in missed messages.

#### `Panda.unpause()` -> `boolean`
Pauses reading in messages from the active connection. Returns true only if the stream was paused.

#### `Panda.resume()` -> `boolean`
Alias for `unpause`.

#### `Panda.isConnected()` -> `boolean`
Returns true if the panda instance is currecntly connected to a USB device.

#### `Panda.isPaused()` -> `boolean`
Returns true if the panda instance currently has message reading paused

#### `Panda.getHealth()` -> `HealthStatus`
Requests the current health of the Panda unit. Only available while connected, returns the health object on success or errors.

* `HealthStatus`: (object)
  * `voltage`: (number)
  * `current`: (number)
  * `isStarted`: (boolean)
  * `controlsAreAllowed`: (boolean)
  * `isGasInterceptorDetector`: (boolean)
  * `isStartSignalDetected`: (boolean)
  * `isStartedAlt`: (boolean)

#### `Panda.getDeviceMetadata()` -> `[string, string]`
Requests both the serial number and secret from the Panda device. This is used internally to power `getSerialNumber` and `getSecret`.

Returns an array with 2 items in, the serial number and then the secret.

#### `Panda.getSerialNumber()` -> `string`
Requests the serial number.

This function is the same as running
```js
panda.getDeviceMetadata()
  .then((result) => result[0])
```

#### `Panda.getSecret()` -> `string`
Requests the secret used for wifi among other things.

This function is the same as running
```js
panda.getDeviceMetadata()
  .then((result) => result[1])
```

#### `Panda.getVersion()` -> `string`
Requests the string version number, output will look something like `v1.0.1-11d45090-RELEASE`

#### `Panda.isWhite()` -> `boolean`
Query if the Panda device is a white Panda. Returns true if it is white.

#### `Panda.isGrey()` -> `boolean`
Query if the Panda device is a grey Panda. Returns true if it is grey.

#### `Panda.isBlack()` -> `boolean`
Query if the Panda device is a black Panda. Returns true if it is black.

#### `Panda.hasObd()` -> `boolean`
Query if the Panda device has a connection to the OBD port. Returns true if it has an OBD port connection.

#### `Panda.setObd(connected)` -> `void`
Connect Panda device to the OBD port (if supported and parameter is `true`).

#### `Panda.setSafetyMode(mode)` -> `void`
Sets the safety mode on the Panda device.

 * `mode`: (*required* `SafetyMode`) The safety mode to enter. Must be a valid safety mode, safety modes are exposed as constants on the root of the library.

```js
import { SAFETY_NOOUTPUT, SAFETY_ELM327, SAFETY_ALLOUTPUT } from '@commaai/pandajs';
```

### Events
#### `Panda.onMessage(listener)` -> `function`
Register a handler for receiving messages. This should be done before calling `start` to avoid missing any messages. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (messageData)`) Handler to call each time messages are received
  * `messageData`: (object)
    * `time`: (number) High precision time in which this event was received.
    * `canMessages`: (Array<CanMessage>)
      * `bus`: (number) The bus this message came from
      * `address`: (number) The bus specific address for the message
      * `busTime`: (number) The recieve time according to the bus
      * `data`: (ByteArray) Raw data for this message

#### `Panda.onError(listener)` -> `function`
Register an error handler. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (err)`) Handler to call when errors occur
  * `err`: (object)
    * `error`: (Error) Error object incurred
    * `event`: (string) Description of where the error occured

#### `Panda.onConnect(listener)` -> `function`
Register a handler to run when successfully connecting to a Panda device. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (usbId)`) Handler to call when connected
  * `usbId`: (string) The ID of the USB device connected to.

#### `Panda.onDisconnect(listener)` -> `function`
Register a handler to run when disconnecting from a Panda device. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (usbId)`) Handler to call when disconnected
  * `usbId`: (string) The ID of the USB device disconnected from.

## Command Line Tools
This package ships with 2 CLI tools. Check the `--help` on each to see all of their options.

#### `dump-can`
This is used to dump metadata about the incoming CAN messages, or output the entire messages with `-a`.

Examples:
```bash
$ dump-can
Connected: ba435375436c2a6d
{ voltage: 12.123,
  current: 4.093,
  isStarted: false,
  controlsAreAllowed: false,
  isGasInterceptorDetector: false,
  isStartSignalDetected: false,
  isStartedAlt: false }
Connect finished, waiting then reading all messages...
Start reading...
Message count: 1
First message CAN count: 256
First CAN message: { address: 420,
  busTime: 54858,
  data: <Buffer 00 66 00 02 00 00 00 0b>,
  bus: 0 }
Message count: 1
First message CAN count: 256
First CAN message: { address: 1024,
  busTime: 6626,
  data: <Buffer 79 00 02 00 0a 78 00 09>,
  bus: 1 }
```
```bash
$ dump-can -an
{"time":7.3178732019999995,"canMessages":[{"address":1024,"busTime":53980,"data":[121,0,2,0,10,120,0,9],"bus":1},{"address":420,"busTime":54066,"data":[0,102,0,2,0,0,0,11],"bus":0},{"address":1024,"busTime":54115,"data":[121,0,2,0,10,120,0,9],"bus":1}]}
{"time":7.318214842000001,"canMessages":[{"address":420,"busTime":54202,"data":[0,102,0,2,0,0,0,11],"bus":0},{"address":1024,"busTime":54250,"data":[121,0,2,0,10,120,0,9],"bus":1},{"address":420,"busTime":54338,"data":[0,102,0,2,0,0,0,11],"bus":0}]}
{"time":7.31846793,"canMessages":[{"address":1024,"busTime":54385,"data":[121,0,2,0,10,120,0,9],"bus":1},{"address":420,"busTime":54474,"data":[0,102,0,2,0,0,0,11],"bus":0}]}
```

#### `control-panda`
This is a convenience tool wrapping each of the get and set methods exposed by this library.

Examples:
```bash
$ ./control-panda.js wifi
SID: panda-2baf789dacdacb64
Password: aGBw61RwD0
```
```bash
$ ./control-panda.js version
v1.0.1-11d45090-RELEASE
```

## Contributing
`yarn run test`

# License
MIT @ comma.ai

Read more about how to get started hacking your car with [panda](https://shop.comma.ai/products/panda-obd-ii-dongle) [here](https://medium.com/@comma_ai/a-panda-and-a-cabana-how-to-get-started-car-hacking-with-comma-ai-b5e46fae8646).
