export const PERIOD_OPTIONS = [
  {
    key: 'last_1_year',
    title: 'Last 1 year',
  },
  {
    key: 'last_3_year',
    title: 'Last 3 years',
  },
  {
    key: 'all_times',
    title: 'All times',
  },
  {
    key: 'past_1_year',
    title: 'Past 1 year',
  },
  {
    key: 'past_3_years',
    title: 'Past 3 years',
  },
  {
    key: 'past_7_days',
    title: 'Past 7 days',
  },
  {
    key: 'past_28_days',
    title: 'Past 28 days',
  },
  {
    key: 'past_90_days',
    title: 'Past 90 days',
  },
  {
    key: 'past_12_months',
    title: 'Past 12 months',
  },
];

export type ZoneOptionType = { key: number; title: string };

export const calcDefultZone = (
  options: Array<{ key: number; title: string }> = []
) => {
  const DEFAULT_ZONE = Math.max(
    Math.min(
      Math.round(12 - new Date().getTimezoneOffset() / 60),
      options.length - 1
    ),
    0
  );

  return DEFAULT_ZONE;
};

export const generateZoneOptions = () => {
  const ZONE_OPTIONS: Array<ZoneOptionType> = [];

  for (let i = -12; i <= 13; i++) {
    ZONE_OPTIONS.push({
      key: i,
      title: i > 0 ? `+${i}` : i === 0 ? '0' : `${i}`,
    });
  }

  const DEFAULT_ZONE = calcDefultZone(ZONE_OPTIONS);

  return {
    ZONE_OPTIONS,
    DEFAULT_ZONE,
  };
};
