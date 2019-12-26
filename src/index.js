import PandaDevice from './panda-device';
import PandaAPI from './panda';

export const SAFETY_SILENT = 0;
export const SAFETY_HONDA_NIDEC = 1;
export const SAFETY_TOYOTA = 2;
export const SAFETY_ELM327 = 3;
export const SAFETY_GM = 4;
export const SAFETY_HONDA_BOSCH_GIRAFFE = 5;
export const SAFETY_FORD = 6;
export const SAFETY_CADILLAC = 7;
export const SAFETY_HYUNDAI = 8;
export const SAFETY_CHRYSLER = 9;
export const SAFETY_TESLA = 10;
export const SAFETY_SUBARU = 11;
export const SAFETY_MAZDA = 13;
export const SAFETY_VOLKSWAGEN = 15;
export const SAFETY_TOYOTA_IPAS = 16;
export const SAFETY_ALLOUTPUT = 17;
export const SAFETY_GM_ASCM = 18;
export const SAFETY_NOOUTPUT = 19;
export const SAFETY_HONDA_BOSCH_HARNESS = 20;

export default function Panda (options) {
  options = options || {};
  options.selectDevice = options.selectDevice || selectFirstDevice;

  var device = new PandaDevice(options);
  options.device = device;
  return new PandaAPI(options);
}

function selectFirstDevice (devices) {
  return devices[0];
}
