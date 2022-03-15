import { packCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import wait from '../delay';

const PANDA_VENDOR_ID = 0xbbaa;
//const PANDA_PRODUCT_ID = 0xddcc;

const BUFFER_SIZE = 0x10 * 256;

const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor(options, usb) {
    this.usb = usb;
    this.device = null;
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);
  }

  async connect() {
    // Must be called via a mouse click handler, per Chrome restrictions.
    this.device = await this.usb.requestDevice({
      filters: [{ vendorId: PANDA_VENDOR_ID }]
    });
    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);

    return true;
  }

  async disconnect() {
    if (!this.device) {
      return false;
    }
    await this.device.close();
    this.device = null;

    return true;
  }

  async vendorRequest(data, length) {
    // data is request, value, index
    const controlParams = {
      requestType: 'vendor',
      recipient: 'device',
      request: data.request,
      value: data.value,
      index: data.index
    };

    const result = await this.device.controlTransferIn(controlParams, length);
    return {
      data: Buffer.from(result.data.buffer),
      status: result.status
    };
  }

  async vendorWrite(data, length) {
    // data is request, value, index
    const controlParams = {
      requestType: 'vendor',
      recipient: 'device',
      request: data.request,
      value: data.value,
      index: data.index
    };

    await this.device.controlTransferOut(controlParams, length);

    return true;
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
    let result = null;
    let attempts = 0;

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
