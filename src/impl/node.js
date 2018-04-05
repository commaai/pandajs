import USB from 'usb';
import { packCAN, unpackCAN } from 'can-message';
import Event from 'weakmap-event';
import { partial } from 'ap';
import now from 'performance-now';
import wait from '../delay';
import isPromise from 'is-promise';

const PANDA_VENDOR_ID = 0xbbaa;
const PANDA_MESSAGE_ENDPOINT_NUMBER = 1;
// const PANDA_PRODUCT_ID = 0xddcc;

const BUFFER_SIZE = 0x10 * 256;

const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class Panda {
  constructor(options) {
    this.device = null;
    this.selectDeviceMethod = options.selectDevice;
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);
  }

  async findDevice() {
    var devices = USB.getDeviceList();

    devices = devices.filter((device) => {
      return device.deviceDescriptor.idVendor === PANDA_VENDOR_ID;
    });

    return this.selectDevice(devices);
  }
  async selectDevice(devices) {
    return new Promise((resolve, reject) => {
      var result = this.selectDeviceMethod(devices, resolve);

      if (result) {
        if (isPromise(result)) {
          result
            .then(resolve)
            .catch(reject);
        } else {
          resolve(result);
        }
      }
    })
  }
  async setConfiguration(config) {
    return new Promise((resolve, reject) => {
      this.device.setConfiguration(1, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
  async getStringDescriptor(index) {
    return new Promise((resolve, reject) => {
      this.device.getStringDescriptor(index, (err, buffer) => {
        if (err) {
          return reject(err);
        }
        resolve(buffer.toString());
      });
    });
  }
  async connect() {
    this.device = await this.findDevice();
    await this.device.open(false);
    await this.setConfiguration(1);
    await this.device.interface(0).claim();

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
    return new Promise((resolve, reject) => {
      // data is request, value, index
      const flags = USB.LIBUSB_RECIPIENT_DEVICE | USB.LIBUSB_REQUEST_TYPE_VENDOR | USB.LIBUSB_ENDPOINT_IN;

      this.device.controlTransfer(flags, data.request, data.value, data.index, length, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve({
          data: Buffer.from(data),
          status: "ok" // hack, find out when it's actually ok
        });
      });
    });
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

  async transferIn (endpointNumber, length) {
    // in endpoints are on another address scope, so we or in 0x80 to get 0x81
    endpointNumber = endpointNumber | 0x80;

    return new Promise(async (resolve, reject) => {
      var endpoint = null;
      this.device.interfaces.some(iface => {
        const epoint = iface.endpoint(endpointNumber);

        if (epoint) {
          endpoint = epoint;
          return true;
        }
      });
      if (!endpoint) {
        let err = new Error('PandaJS: nodeusb: transferIn failed to find endpoint interface ' + endpointNumber);
        ErrorEvent.broadcast(this, err);
        return reject(err);
      }
      if (endpoint.direction !== 'in') {
        let err = new Error('PandaJS: nodeusb: endpoint interface is ' + endpoint.direction + ' instead of in');
        ErrorEvent.broadcast(this, err);
        return reject(err);
      }
      var data = Buffer.from([]);
      while (data.length === 0) {
        data = await this.endpointTransfer(endpoint, length);
      }
      resolve(data);
    });
  }

  async endpointTransfer (endpoint, length) {
    return new Promise((resolve, reject) => {
      endpoint.transfer(length, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
      });
    });
  }

  async nextMessage() {
    var result = null;
    var attempts = 0;

    while (result === null) {
      try {
        return await this.transferIn(1, BUFFER_SIZE);
      } catch (err) {
        console.log(err);
        console.warn('can_recv failed, retrying');
        attempts = Math.min(++attempts, 10);
        await wait(attempts * 100);
      }
    }
  }
}
