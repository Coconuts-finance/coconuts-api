import { ApysCalculator as PolygonApyCalculator } from "./network/polygon/apysCalculator";

async function getData(network, cachebuster) {

  let calculator = null;
  switch (network) {
    case 137 :
    default :
      calculator = PolygonApyCalculator;
      break;
  }
  const vaults = await calculator.getApysCalculation();
  return vaults;
}

export const ApysManager = {
  getData,
};