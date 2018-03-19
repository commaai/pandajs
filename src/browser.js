import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import now from 'performance-now';
import wait from './wait';

const PANDA_VENDOR_ID = 0xbbaa;
//const PANDA_PRODUCT_ID = 0xddcc;

const BUFFER_SIZE = 0x10 * 256;

const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor() {
    this.device = null;
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);
  }

  async connect() {
    // Must be called via a mouse click handler, per Chrome restrictions.
    this.device = await navigator.usb.requestDevice({ filters: [{ vendorId: PANDA_VENDOR_ID }] });
    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);

    return this.device.serialNumber;
  }

  async disconnect() {
    if (!this.device) {
      return false;
    }
    await this.device.close();
    this.device = null;

    return true;
  }

  async health() {
    const controlParams = {
      requestType: 'vendor',
      recipient: 'device',
      request: 0xd2,
      value: 0,
      index: 0
    };
    try {
      let data = await this.device.controlTransferIn(controlParams, 13);
    } catch (err) {
      ErrorEvent.broadcast(this, { event: 'Panda.health failed', error: err });
    }
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

  async nextMessage() {
    var result = null;
    var attempts = 0;

    while (result === null) {
      try {
        result = await this.device.transferIn(1, BUFFER_SIZE);
      } catch (err) {
        console.warn('can_recv failed, retrying');
        attempts = Math.min(++attempts, 10);
        await wait(attempts * 100);
      }
    }

    return result.data.buffer;
  }
}
