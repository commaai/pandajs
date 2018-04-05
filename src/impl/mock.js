// a mock interface for USB communications
// this is used by the test cases
import Event from 'weakmap-event';
import wait from '../delay';
import { partial } from 'ap';

const ErrorEvent = Event();
const ConnectEvent = Event();
const DisconnectEvent = Event();

export default class MockPanda {
  constructor() {
    this.onError = partial(ErrorEvent.listen, this);
    this.onConnect = partial(ConnectEvent.listen, this);
    this.onDisconnect = partial(DisconnectEvent.listen, this);
  }

  async vendorRequest (params, length) {
    switch (params.request) {
      case 0xd2:
        return {
          data: Buffer.from('0x6c2f0000b20f00000000000000'),
          status: 'ok'
        };
      case 0xd0:
        return {
          data: Buffer.from('0x626134333533373534333663326136646b347a6776366c527744ffff6fe25de5'),
          status: 'ok'
        };
      default:
        console.error('UNMOCKED API CALL MADE', params.request);
    }
  }

  async connect() {
    await wait(100);
    return '123345123'
  }

  async disconnect() {
    await wait(100);
    DisconnectEvent.broadcast(this, '123345123');
  }

  async nextMessage() {
    if (~~(Math.random() * 20) === 0) {
      await wait(10);
    }
    return Buffer.from('ab'.repeat(16), 'hex');
  }
}
