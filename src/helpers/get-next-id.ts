/**
 * fast uniq key generator
 * 95^n
 * n = 1 => 95
 * n = 2 => 9025
 * n = 3 => 857k
 * n = 4 => 81M
 * n = 5 => 7.7B
 * this enought for real cases
 */

// safety printable ASCII
let chars = '';

for (let i = 32; i <= 126; i++) {
  chars += String.fromCharCode(i);
}

const charlen = chars.length;
/**
 *
 * @param prevId
 * @returns
 */
export const getNextId = (prevId: number[]) => {
  for (let i = prevId.length - 1; i >= 0; i--) {
    if (prevId[i] < charlen) {
      prevId[i]++;
      break;
    }
    prevId[i] = 0;
    if (!i) {
      prevId.unshift(0);
    }
  }
  let result = '';
  for (const indx of prevId) {
    result += chars[indx];
  }
  return result;
};
