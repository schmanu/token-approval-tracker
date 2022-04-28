/**
 * Creates a Map from an array and a key function.
 * @param list array that should be reduced
 * @param keyFunc computes to which key the list entry will be added
 * @returns a map which maps from keys to all list entries, which computed that key for their value
 */
export function reduceToMap<T, K extends string | number>(list: Array<T>, keyFunc: (value: T) => K) {
  return list.reduce((prev, curr) => {
    const key = keyFunc(curr);
    prev.has(key) ? prev.get(key)?.push(curr) : prev.set(key, [curr]);
    return prev;
  }, new Map<K, T[]>());
}

/**
 * Creates a set from an array and a value function.
 * @param list array that should be reduced
 * @param valueFunc computes the value for list entry and adds it to the set
 * @returns the resulting set
 */
export function reduceToSet<T, V>(list: Array<T>, valueFunc: (value: T) => V) {
  return list.reduce((prev, curr) => {
    const value = valueFunc(curr);
    prev.add(value);
    return prev;
  }, new Set<V>());
}
