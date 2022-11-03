const weekdayDateMap = {
  Mon: new Date('2020-01-06T00:00:00.000Z'),
  Tue: new Date('2020-01-07T00:00:00.000Z'),
  Wed: new Date('2020-01-08T00:00:00.000Z'),
  Thu: new Date('2020-01-09T00:00:00.000Z'),
  Fri: new Date('2020-01-10T00:00:00.000Z'),
  Sat: new Date('2020-01-11T00:00:00.000Z'),
  Sun: new Date('2020-01-12T00:00:00.000Z'),
};
const shortWeekdays = Object.keys(weekdayDateMap);

export const getDayOfWeek = (shortName, locale = 'en-US', length: 'short' | 'long' | 'narrow' = 'short') =>
  new Intl.DateTimeFormat(locale, { weekday: length }).format(weekdayDateMap[shortName]);

export const getDaysOfWeek = (locale = 'en-US', length: 'short' | 'long' | 'narrow' = 'short') =>
  shortWeekdays.map(shortName => getDayOfWeek(shortName, locale, length));
