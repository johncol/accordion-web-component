export const Keys = {
  ENTER: 13,
  SPACE: 32,
};

export const keyPressedIsAnyOf = (event, ...keys) => {
  return keys.some((key) => event.which === key);
};
