# PandaJS
Interract with your [Panda OBD-II Dongle](https://shop.comma.ai/products/panda-obd-ii-dongle) from JavaScript.

Support
 * [x] Browser
 * [ ] React Native
 * [ ] Node

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
panda.resume();

// close connects and take everything down
panda.disconnect();
```

## API

#### `new Panda([options])` -> `Panda`
Creates a new Panda instance

* `options` *optional*
  * `selectDevice`: (*optional* `function(devices, callback)`) A user defined function for selecting which available device to use, parameters are an array of discovered devices and a callback function. The method can either return the desired device, return a promise, or use the callback function. There is no timeout for this method, so make sure it eventually does one of those three things.

### Methods
#### `Panda.connect()` -> `Promise: string`
Tell the Panda instance to connect to USB. Does not start reading messages until you call `start`. On success, returns the ID of the USB device found.

#### `Panda.disconnect()` -> `Promise: boolean`
Disconnect from the USB device and stop everything. Returns true if it was running before.

#### `Panda.health()` -> `HealthStatus`
Requests the current health of the Panda unit. Only available while connected, returns the health object on success or errors.

* `HealthStatus`:
  * `voltage`: (number)
  * `current`: (number)
  * `isStarted`: (boolean)
  * `controlsAreAllowed`: (boolean)
  * `isGasInterceptorDetector`: (boolean)
  * `isStartSignalDetected`: (boolean)
  * `isStartedAlt`: (boolean)

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

#### `Panda.isConnected()` -> `boolean`
Returns true if the panda instance is currecntly connected to a USB device.

#### `Panda.isPaused()` -> `boolean`
Returns true if the panda instance currently has message reading paused

### Events
#### `Panda.onMessage(listener)` -> `function`
Register a handler for receiving messages. This should be done before calling `start` to avoid missing any messages. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (messageData)`) Handler to call each time messages are received
  * `messageData`:
    * `time`: (number) High precision time in which this event was received.
    * `canMessages`: (Array<CanMessage>)
      * `bus`: (number) The bus this message came from
      * `address`: (number) The bus specific address for the message
      * `busTime`: (number) The recieve time according to the bus
      * `data`: (ByteArray) Raw data for this message

#### `Panda.onError(listener)` -> `function`
Register an error handler. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (err)`) Handler to call when errors occur
  * `err`:
    * `error`: (Error) Error object incurred
    * `event`: (string) Description of where the error occured

#### `Panda.onConnect(listener)` -> `function`
Register a handler to run when successfully connecting to a Panda device. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (usbId)`) Handler to call when connected
  * `usbId`: (string) The ID of the USB device connected to.

#### `Panda.onConnect(listener)` -> `function`
Register a handler to run when disconnecting from a Panda device. Returns an `unlisten` function that will disable the listener when called.

* `listener`: (*required*, `function (usbId)`) Handler to call when disconnected
  * `usbId`: (string) The ID of the USB device disconnected from.

## Contributing
`yarn run test`

# License
MIT @ comma.ai

Read more about how to get started hacking your car with Panda [here](https://medium.com/@comma_ai/a-panda-and-a-cabana-how-to-get-started-car-hacking-with-comma-ai-b5e46fae8646).
