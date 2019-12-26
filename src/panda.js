import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import now from 'performance-now';
import raf from 'raf';
import { timeout } from 'thyming';

import wait from './delay';

// how many messages to batch at maximum when reading as fast as we can
const MAX_MESSAGE_QUEUE = 5000;

const MessageEvent = Event();
const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor(options) {
    // setup event handlers
    this.onMessage = partial(MessageEvent.listen, this);
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);

    // initialize device object
    this.device = options.device;
    this.device.onError(partial(ErrorEvent.broadcast, this));
    this.device.onConnect(this.connectHandler.bind(this));
    this.device.onDisconnect(this.disconnectHandler.bind(this));

    // member variables
    this.paused = true;
    this.messageQueue = [];

    // function binding
    this.readLoop = this.readLoop.bind(this);
    this.flushMessageQueue = this.flushMessageQueue.bind(this);
  }

  // state getters
  isConnected() {
    return !!this.connected;
  }
  isPaused() {
    return !!this.paused;
  }

  // methods
  async connect() {
    if (this.isConnected()) {
      return this.connected;
    }
    await this.device.connect();

    var serialNumber = await this.getSerialNumber();
    this.connectHandler(serialNumber);

    return serialNumber;
  }
  async disconnect() {
    if (!this.isConnected()) {
      return false;
    }
    return this.device.disconnect();
  }
  async start() {
    await this.connect();
    return this.unpause();
  }
  async pause() {
    var wasPaused = this.isPaused();
    this.paused = true;

    return !wasPaused;
  }
  async resume() {
    return this.unpause();
  }
  async unpause() {
    var wasPaused = this.isPaused();
    if (!wasPaused) {
      return false;
    }

    this.paused = false;
    this.startReading();

    return wasPaused;
  }

  // vendor API methods
  async getHealth() {
    let buf = await this.vendorRequest('health', {
      request: 0xd2,
      value: 0,
      index: 0
    }, 13);

    let voltage = buf.readUInt32LE(0) / 1000;
    let current = buf.readUInt32LE(4) / 1000;
    let isStarted = buf.readInt8(8) === 1;
    let controlsAreAllowed = buf.readInt8(9) === 1;
    let isGasInterceptorDetector = buf.readInt8(10) === 1;
    let isStartSignalDetected = buf.readInt8(11) === 1;
    let isStartedAlt = buf.readInt8(12) === 1;

    return {
      voltage,
      current,
      isStarted,
      controlsAreAllowed,
      isGasInterceptorDetector,
      isStartSignalDetected,
      isStartedAlt
    };
  }
  async getDeviceMetadata() {
    let buf = await this.vendorRequest('getDeviceMetadata', {
      request: 0xd0,
      value: 0,
      index: 0
    }, 0x20);

    let serial = buf.slice(0, 0x10); // serial is the wifi style serial
    let secret = buf.slice(0x10, 0x10 + 10);
    let hashSig = buf.slice(0x1c);

    return [serial.toString(), secret.toString()];
  }
  async getSerialNumber() {
    var [serial, secret] = await this.getDeviceMetadata();
    return serial;
  }
  async getSecret() {
    var [serial, secret] = await this.getDeviceMetadata();
    return secret;
  }
  async getVersion() {
    let buf = await this.vendorRequest('getVersion', {
      request: 0xd6,
      value: 0,
      index: 0
    }, 0x40);

    return buf.toString();
  }
  async getType() {
    let buf = await this.vendorRequest('getType', {
      request: 0xc1,
      value: 0,
      index: 0
    }, 0x40);

    return buf.length ? buf[0] : null;
  }
  async isWhite() {
    return await this.getType() === 1;
  }
  async isGrey() {
    return await this.getType() === 2;
  }
  async isBlack() {
    return await this.getType() === 3;
  }
  async hasObd() {
    return await this.getType() > 2;
  }
  async setObd(obd) {
    await this.vendorWrite('setObd', {
      request: 0xdb,
      value: obd ? 1 : 0,
      index: 0
    });
  }
  async setSafetyMode(mode) {
    await this.vendorWrite('setSafetyMode', {
      request: 0xdc,
      value: mode,
      index: 0
    });
  }

  // i/o wrappers
  async vendorRequest (event, controlParams, length) {
    try {
      let result = await this.device.vendorRequest(controlParams, length);

      return result.data;
    } catch (err) {
      ErrorEvent.broadcast(this, { event: 'Panda.' + event + ' failed', error: err });
      throw err;
    }
  }
  async vendorWrite (event, controlParams, message) {
    if (!message || !message.length) {
      message = Buffer.from([]);
    }
    try {
      let result = await this.device.vendorWrite(controlParams, message);

      return result.data;
    } catch (err) {
      ErrorEvent.broadcast(this, { event: 'Panda.' + event + ' failed', error: err });
      throw err;
    }
  }

  // event handlers
  connectHandler(usbId) {
    this.connected = usbId;
    ConnectEvent.broadcast(this, usbId);
  }
  disconnectHandler() {
    const previousConnection = this.connected;
    this.connected = false;
    this.paused = true;
    DisconnectEvent.broadcast(this, previousConnection);
  }

  // message queueing and flushing
  needsFlushMessageQueue() {
    this.needsFlush = true;
    if (this.flushEvent) {
      return this.flushEvent;
    }

    var unlisten = raf(this.flushMessageQueue);

    this.flushEvent = () => {
      raf.cancel(unlisten);
      this.flushEvent = false;
    };

    return this.flushEvent;
  }
  flushMessageQueue() {
    this.flushEvent();

    if (this.needsFlush && this.messageQueue.length) {
      let messageQueue = this.messageQueue;
      this.messageQueue = [];
      this.needsFlush = false;
      MessageEvent.broadcast(this, messageQueue);
    }
  }
  // internal reading loop
  startReading() {
    if (this.isReading) {
      return true;
    }
    if (this.isPaused()) {
      return false;
    }

    // start loop!
    this.isReading = true;
    this.readLoop();
  }
  async readLoop() {
    if (this.isPaused()) {
      this.isReading = false;
      return false;
    }
    this.isReading = true;

    for (let i = 0; i < MAX_MESSAGE_QUEUE; ++i) {
      let data = await this.device.nextMessage();
      let receiptTime = now() / 1000
      let canMessages = unpackCAN(data);
      if (!canMessages.length) {
        await wait(1);
        continue;
      }
      this.messageQueue.push({
        time: receiptTime,
        canMessages
      });
      this.needsFlushMessageQueue();
    }
    this.needsFlushMessageQueue();

    // repeat!
    timeout(this.readLoop);
  }
}
