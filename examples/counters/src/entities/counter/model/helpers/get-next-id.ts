/**
 *
 * @param prevId
 * @returns
 */
export const getNextId = (prevId: number[]) => {
  for (let i = prevId.length - 1; i >= 0; i--) {
    if (prevId[i] < 35) {
      prevId[i]++;
      break;
    }
    prevId[i] = 0;
    if (!i) {
      prevId.unshift(0);
    }
  }
  return prevId.map((e) => e.toString(36)).join('');
};
