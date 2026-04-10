import moment from 'moment';

export const moneyFormat = (money) => {
  return Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(money);
};

export const getPercentPriceReduction = (price, priceOld) => {
  const calculate = (price / priceOld) * 100;
  const percent = 100 - calculate;

  let result = percent.toFixed(2);

  const roundedNumber = percent.toFixed(2);

  if (percent % 1 === 0 || roundedNumber.endsWith('00')) result = percent;
  if (roundedNumber.endsWith('0')) result = percent.toFixed(1);

  if (result) return `-${result}%`;
  return null;
};

/**
 * @see https://gist.github.com/tungvn/2460c5ba947e5cbe6606c5e85249cf04
 */
export const phoneRegExp = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

export const getDate = (value) => {
  return moment(value?.seconds, 'mm:ss').format('DD-MM-YYYY');
};
