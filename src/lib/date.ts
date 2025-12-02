import { toZonedTime } from 'date-fns-tz';

const ADELAIDE_TIMEZONE = 'Australia/Adelaide';

export const getAdelaideDate = (): Date => {
  return toZonedTime(new Date(), ADELAIDE_TIMEZONE);
};
