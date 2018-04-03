// a mock interface for USB communications
// this is used by the test cases
import Event from 'weakmap-event';
import { promise as wait } from 'es6-sleep';
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

  async connect() {
    await wait(100);
    ConnectEvent.broadcast(this, '123345123');
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
