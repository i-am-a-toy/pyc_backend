export const getYearString = (date: Date): string => {
  return date.getFullYear().toString();
};

export const getMonthString = (date: Date): string => {
  const monthString = date.getMonth().toString();

  if (monthString === '0') {
    return '01';
  } else if (monthString.length === 1) {
    return `0${monthString}`;
  } else {
    return (+monthString + 1).toString();
  }
};

export const getMonthFirstDay = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date);
  return new Date(`${year}-${month}-01`);
};

export const getMonthLastDay = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date);
  return new Date(`${year}-${month}-${new Date(+year, +month, 0).getDate()}`);
};

export const getYearFirstDay = (date: Date): Date => {
  return new Date(`${date.getFullYear().toString()}-01-01`);
};

export const getYearLastDay = (date: Date): Date => {
  return new Date(`${date.getFullYear().toString()}-12-31`);
};
