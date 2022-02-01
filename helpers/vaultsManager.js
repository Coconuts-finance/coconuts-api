import { vaults as polygonVaults } from "../utils/polygon/vaults/vaults";
import { stakes as polygonStakes } from "../utils/polygon/stake/stake";
import { vaults as avalancheVaults } from "../utils/avalanche/vaults/vaults";

function getData(network, type) {
  switch (network) {
    case 43114 :
      return avalancheVaults;
      break;
    case 137 :
    default :
      if (type == 'stakes') {
        return polygonStakes;
      }
      return polygonVaults;
  }
}

export const VaultsManager = {
  getData,
}