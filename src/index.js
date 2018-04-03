import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import now from 'performance-now';
import raf from 'raf';
import { timeout } from 'thyming';

import { promise as wait } from 'es6-sleep';
import PandaUSB from './panda-usb';

// how many messages to batch at maximum when reading as fast as we can
const MAX_MESSAGE_QUEUE = 5000;

const MessageEvent = Event();
const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor(options) {
    options = options || {};

    options.selectDevice = options.selectDevice || selectFirstDevice;

    // setup event handlers
    this.onMessage = partial(MessageEvent.listen, this);
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);

    // initialize device object
    this.device = PandaUSB(options);
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
    return this.device.connect();
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
  async health() {
    const controlParams = {
      request: 0xd2,
      value: 0,
      index: 0
    };
    try {
      let result = await this.device.vendorRequest(controlParams, 13);
      let buf = result.data;

      let voltage = buf.readUInt32LE(0);
      let current = buf.readUInt32LE(4);
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
    } catch (err) {
      ErrorEvent.broadcast(this, { event: 'Panda.health failed', error: err });
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

function selectFirstDevice (devices) {
  return devices[0];
}
