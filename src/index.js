import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import now from 'performance-now';
import raf from 'raf';
import { timeout } from 'thyming';

import wait from './wait';
import PandaUSB from './panda-usb';

// how many messages to batch at maximum when reading as fast as we can
const MAX_MESSAGE_QUEUE = 5000;

const MessageEvent = Event();
const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor() {
    this.onMessage = partial(MessageEvent.listen, this);
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);

    this.device = PandaUSB();
    this.device.onError(partial(ErrorEvent.broadcast, this));
    this.device.onConnect(this.connectHandler.bind(this));
    this.device.onDisconnect(this.disconnectHandler.bind(this));

    this.paused = true;
    this.messageQueue = [];

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
    return this.device.health();
  }

  // event handlers
  connectHandler(usbId) {
    this.connected = usbId;
  }
  disconnectHandler() {
    this.connected = false;
    this.paused = true;
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
