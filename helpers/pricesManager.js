import { vaults as polygonVaults } from "../utils/polygon/vaults/vaults";
import { vaults as avalancheVaults } from "../utils/avalanche/vaults/vaults";
import { stakes as polygonStakes } from "../utils/polygon/stake/stake";

function getData(network) {
  const vaults = [
    polygonVaults,
    avalancheVaults,
  ];
  let stakes = [
    polygonStakes,
  ];

  let o = {};
  for (const [i, networkVaults] of vaults.entries()) {
    for (const [j, vault] of networkVaults.entries()) {
      if (o[vault.token] == undefined) {
        o[vault.token] = vault.oracleId;
      }
    }
  }

  for (const [k, networkStakes] of stakes.entries()) {
    for (const [l, stake] of networkStakes.entries()) {
      if (o[stake.token] == undefined) {
        o[stake.token] = stake.tokenOracleId;
      }
      if (o[stake.earnedToken] == undefined) {
        o[stake.earnedToken] = stake.earnedOracleId;
      }
    }
  }
  return o;
}

export const PricesManager = {
  getData,
};