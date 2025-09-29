// Reduces a number to a single digit or a master number (11, 22, 33)
export const reduceNumber = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) {
      return num;
    }
    if (num < 10) {
      return num;
    }
    let sum = 0;
    String(num).split('').forEach(digit => {
      sum += parseInt(digit, 10);
    });
    // Recursively reduce until it's a single digit or master number
    if (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      return reduceNumber(sum);
    }
    return sum;
  };