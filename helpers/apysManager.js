import { ApysCalculator as GlobalApyCalculator } from "./network/apysCalculator";
import PolygonAbi from "../utils/polygon/abi.json";
import AvalancheAbi from "../utils/avalanche/abi.json"

async function getData(network, cachebuster) {

  let calculator = null;
  let abi = null;

  switch (network) {
    case 43114 :
      abi = AvalancheAbi;
      calculator = GlobalApyCalculator;
      break;
    case 137 :
      abi = PolygonAbi;
      calculator = GlobalApyCalculator;
  }

  if (calculator != undefined) {
    const vaults = await calculator.getApysCalculation(network, abi);
    return vaults;
  }
  return [];
}

export const ApysManager = {
  getData,
};