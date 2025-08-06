/**
 * Exclude keys from object
 * @param obj
 * @param keys
 * @returns
 */
const exclude = <Type, Key extends keyof Type>(obj: Type, keys: Key[]): Omit<Type, Key> => {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

export default exclude;
