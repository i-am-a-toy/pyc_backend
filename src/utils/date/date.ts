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
    return monthString;
  }
};

export const getMonthFirstDate = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date);
  return new Date(`${year}-${month}-01`);
};

export const getMonthLastDate = (date: Date): Date => {
  const year = getYearString(date);
  const month = getMonthString(date);
  return new Date(`${year}-${month}-${new Date(+year, +month, 0).getDate()}`);
};
