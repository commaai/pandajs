import USB from 'usb';
import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import wait from '../delay';
import isPromise from 'is-promise';
import net from 'net';
import dgram from 'dgram';

const PANDA_MESSAGE_ENDPOINT_NUMBER = 1;
const PANDA_HOST = '192.168.0.10';
const PANDA_TCP_PORT = 1337;
const PANDA_UDP_PORT = 1338;

const REQUEST_OUT = 64;
const REQUEST_IN = 192;

const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();
const DataEvent = Event();
const MessageEvent = Event();

export default class Panda {
  constructor(options) {
    this.device = null;

    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);
    this.handleData = this.handleData.bind(this);
    this.handleError = this.handleError.bind(this);
  }
  async connectToTCP() {
    return new Promise((resolve, reject) => {
      var fail = (err) => {
        this.socket = null;
        ErrorEvent.broadcast(this, err);
        reject(err);
      };
      var succeed = () => {
        this.socket.off('close', fail);
        this.socket.off('error', fail);
        resolve();
      };

      this.socket = net.connect(PANDA_TCP_PORT, PANDA_HOST);
      this.socket.on('connect', resolve);
      this.socket.on('close', fail);
      this.socket.on('error', fail);
    });
  }
  async connect() {
    this.ignoreLengths = {};
    await this.connectToTCP();

    this.socket.on('data', this.handleData);
    this.socket.on('close', partial(DisconnectEvent.broadcast, this));
    this.socket.on('error', this.handleError);

    return true;
  }

  async disconnect() {
    if (!this.socket) {
      return false;
    }
    await this.socket.close();
    this.socket = null;

    return true;
  }

  async vendorRequest(data, length) {
    var data = await this.controlRead(REQUEST_OUT, data.request, data.value, data.index, length);
    return {
      data: Buffer.from(data),
      status: "ok" // hack, find out when it's actually ok
    };
  }

  // not used anymore, but is nice for reference
  async nextFakeMessage() {
    await wait(10);

    return packCAN({
      address: 0,
      busTime: ~~(Math.random() * 65000),
      data: ''.padEnd(16, '0'),
      bus: 0
    });
  }

  async controlRead(requestType, request, value, index, length) {
    if (!this.ignoreLengths[length]) {
      this.ignoreLengths[length] = 0;
    }
    this.ignoreLengths[length]++;

    const buf = Buffer.alloc(12);
    buf.writeUInt16LE(0, 0);
    buf.writeUInt16LE(0, 2);
    buf.writeUInt8(requestType, 4);
    buf.writeUInt8(request, 5);
    buf.writeUInt16LE(value, 6);
    buf.writeUInt16LE(index, 8);
    buf.writeUInt16LE(length, 10);

    this.socket.write(buf);

    return this.nextIncomingData();
  }

  async nextIncomingData() {
    return new Promise((resolve, reject) => {
      once(partial(DataEvent.listen, this), resolve);
    });
  }

  async nextIncomingMessage() {
    return new Promise((resolve, reject) => {
      once(partial(MessageEvent.listen, this), resolve);
    });
  }

  async nextMessage() {
    var result = null;
    var attempts = 0;

    while (result === null) {
      try {
        return await this.bulkRead(1);
      } catch (err) {
        console.warn('can_recv failed, retrying');
        attempts = Math.min(++attempts, 10);
        await wait(attempts * 100);
      }
    }
  }

  async handleData(buf) {
    const length = buf.readUInt32LE(0);
    const data = buf.slice(4, 4 + length);
    if (this.ignoreLengths[length]) {
      this.ignoreLengths[length]--;
      if (this.ignoreLengths[length] === 0) {
        delete this.ignoreLengths[length];
      }
      DataEvent.broadcast(this, data);
    } else {
      MessageEvent.broadcast(this, data);
    }
  }

  async handleError(err) {
    if (err.errno === 'ETIMEDOUT') {
      DisconnectEvent.broadcast(this, err.errno);
    } else {
      ErrorEvent.broadcast(this, err);
    }
  }

  async bulkRead(endpoint: Number, timeoutMillis: Number = 0) {
      const promise = this.nextIncomingMessage();

      const buf = Buffer.alloc(4);
      buf.writeUInt16LE(endpoint, 0);
      buf.writeUInt16LE(0, 2);
      this.socket.write(buf);

      return promise;
  }
}

function once (event, handler) {
  var unlisten = event(onceHandler);

  return unlisten;

  function onceHandler() {
    unlisten();
    handler.apply(this, arguments);
  }
}
