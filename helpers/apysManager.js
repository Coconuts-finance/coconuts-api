import { ApysCalculator as GlobalApyCalculator } from "./network/apysCalculator";

async function getData(network, cachebuster) {

  let calculator = null;
  switch (network) {
    case 43114 :
    case 137 :
    default :
      calculator = GlobalApyCalculator;
      break;
  }
  const vaults = await calculator.getApysCalculation(network);
  return vaults;
}

export const ApysManager = {
  getData,
};