/**
 * Fast deep equal
 * @param a 
 * @param b 
 * @returns 
 */
function deepEqual(a: any, b: any) {

  if (a === b) return true;


  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);
  if (isArrayA !== isArrayB) return false;


  if (isArrayA) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }


  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
