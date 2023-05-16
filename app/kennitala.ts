export function isValidKennitala(kennitala: string): boolean {
  const kt = kennitala.replace(/-/g, "");
  if (kt.length !== 10) return false;

  const list = kt.split("").map(Number);
  console.log({ list });

  if (list.find((num) => Number.isNaN(num))) {
    return false;
  }

  // Check if first two digits are between 1-72 and not between 31-41
  const dd = parseInt(list[0].toString() + list[1], 10);
  console.log(1);
  if (!(dd > 0 && dd < 72) || (dd > 31 && dd < 41)) return false;

  // Check if third and fourth digits are between 1-12
  const mm = parseInt(list[2].toString() + list[3], 10);
  console.log(2);
  if (!(mm > 0 && mm < 13)) return false;

  // Check if last digit is 0, 8 or 9
  const lastDigit = list[9];
  console.log(3);
  if (!(lastDigit === 0 || lastDigit === 8 || lastDigit === 9)) return false;

  // Check control number
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  const controlNumber = list[8];
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += list[i] * weights[i];
  }

  const remainder = sum % 11;
  const checkdigit = remainder === 0 ? 0 : 11 - remainder;

  if (checkdigit === 10) return false;
  if (checkdigit !== controlNumber) return false;

  return true;
}
