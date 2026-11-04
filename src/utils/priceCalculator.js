// src/utils/priceCalculator.js

// Calculate price based on cloth type and stitching complexity
export function calculatePrice(clothType, complexity) {
  let basePrice = 0;

  switch (clothType) {
    case "cotton":
      basePrice = 50;
      break;
    case "silk":
      basePrice = 100;
      break;
    case "linen":
      basePrice = 70;
      break;
    default:
      basePrice = 50;
  }

  let multiplier = 1;
  switch (complexity) {
    case "simple":
      multiplier = 1;
      break;
    case "moderate":
      multiplier = 1.5;
      break;
    case "complex":
      multiplier = 2;
      break;
    default:
      multiplier = 1;
  }

  return basePrice * multiplier;
}
