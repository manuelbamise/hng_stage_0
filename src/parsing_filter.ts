const KEYWORDS = {
  gender: {
    male: 'male',
    males: 'male',
    men: 'male',
    guy: 'male',
    guys: 'male',
    man: 'male',
    boy: 'male',
    boys: 'male',
    female: 'female',
    females: 'female',
    women: 'female',
    woman: 'female',
    girl: 'female',
    girls: 'female',
  },
  age_group: {
    child: 'child',
    children: 'child',
    kids: 'child',
    kid: 'child',
    teen: 'teen',
    teenager: 'teen',
    teenagers: 'teen',
    adult: 'adult',
    adults: 'adult',
    senior: 'senior',
    elderly: 'senior',
  },
  // ... country mapping
  country_id: {
    nigeria: 'NG',
    ng: 'NG',
    america: 'USA',
    us: 'USA',
    angola: 'AO',
    ao: 'AO',
    kenya: 'KE',
    ke: 'KE',
    china: 'CN',
    cn: 'CN',
    united_kingdom: 'UK',
    uk: 'UK',
  },
};

export const getFiltersFromQuery = (query: string) => {
  const words = query.toLowerCase().split(' ');
  const filters: Record<string, string | number | null> = {};

  const agePatterns = extractAgePatterns(query);
  if (agePatterns.min_age !== undefined) filters.min_age = agePatterns.min_age;
  if (agePatterns.max_age !== undefined) filters.max_age = agePatterns.max_age;

  words.forEach((word) => {
    Object.keys(KEYWORDS).forEach((key) => {
      if (KEYWORDS[key as keyof typeof KEYWORDS].hasOwnProperty(word)) {
        filters[key] =
          KEYWORDS[key as keyof typeof KEYWORDS][
            word as keyof (typeof KEYWORDS)[keyof typeof KEYWORDS]
          ];
      }
    });
  });

  if (query.toLowerCase().match(/male and female/)) {
    delete filters.gender;
  }

  if (words.includes('young')) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  return filters;
};

function extractAgePatterns(query: string): {
  min_age?: number;
  max_age?: number;
} {
  const result: { min_age?: number; max_age?: number } = {};

  if (!query) return result;

  const lowerQuery = query.toLowerCase();

  // Pattern: "above 30", "above 30 years"
  const aboveMatch = lowerQuery.match(/above\s+(\d+)(?:\s+years)?/);
  if (aboveMatch?.[1]) {
    result.min_age = parseInt(aboveMatch[1]);
  }

  // Pattern: "below 18", "below 18 years"
  const belowMatch = lowerQuery.match(/below\s+(\d+)(?:\s+years)?/);
  if (belowMatch?.[1]) {
    result.max_age = parseInt(belowMatch[1]);
  }

  // Pattern: "older than X"
  const olderMatch = lowerQuery.match(/older\s+than\s+(\d+)/);
  if (olderMatch?.[1]) {
    result.min_age = parseInt(olderMatch[1]);
  }

  // Pattern: "younger than X"
  const youngerMatch = lowerQuery.match(/younger\s+than\s+(\d+)/);
  if (youngerMatch?.[1]) {
    result.max_age = parseInt(youngerMatch[1]);
  }

  // Pattern: "age 25", "aged 25"
  const ageMatch = lowerQuery.match(/(?:age\s+|aged\s+)(\d+)/);
  if (ageMatch?.[1] && !result.min_age && !result.max_age) {
    result.min_age = parseInt(ageMatch[1]);
    result.max_age = parseInt(ageMatch[1]);
  }

  // Pattern: "between 18 and 25"
  const betweenMatch = lowerQuery.match(/between\s+(\d+)\s+and\s+(\d+)/);
  if (betweenMatch?.[1] && betweenMatch?.[2]) {
    result.min_age = parseInt(betweenMatch[1]);
    result.max_age = parseInt(betweenMatch[2]);
  }

  // Pattern: "30 years old"
  const yearsMatch = lowerQuery.match(/(\d+)\s+years\s+old/);
  if (yearsMatch?.[1]) {
    if (!result.min_age) result.min_age = parseInt(yearsMatch[1]);
    if (!result.max_age) result.max_age = parseInt(yearsMatch[1]);
  }

  return result;
}
