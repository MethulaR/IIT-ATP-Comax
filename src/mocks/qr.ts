/** A fixed 9 by 9 pattern that reads as a QR code in mocks. Not a real code. */
export const QR = '111011101101010111011101001010001110111010101011101100010101110111011111011101111'
  .split('')
  .slice(0, 81)
  .map((c) => c === '1')
