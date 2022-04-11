// This function is based on https://stackoverflow.com/a/41491220
const textColor = (bgColor) => {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB

  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? 'black' : 'white';
};

export default textColor;
