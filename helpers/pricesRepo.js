
import fs from 'fs'
import axios from 'axios';
import { PricesManager } from '../helpers/pricesManager';
/**
 * Local store for the prices list.
 */
let data = require('../data/prices.json');

/**
 * Temporary store for the cache buster set into the local store.
 */
let oldCacheBuster = null;
/**
 * Cache buster included in the current request.
 */
let currentCacheBuster = null;
/**
 * List of requested tokens.
 */
let requestedTokens = null;

async function getTokenPrice(token) {

  if (data.prices[token] == undefined) {
    let result = await getPrices();
    return result[token];
  }
  return data.prices[token];
}
/**
 *
 * @param {*} tokens
 *   List of tokens to retrieve prices.
 * @param {*} cacheBuster
 *   cache buster value to know if the list must be refreshed.
 * @returns
 *   object with token name as key and current price as value.
 */
async function getPrices(cacheBuster = 'internal') {
  requestedTokens = PricesManager.getData();
  currentCacheBuster = cacheBuster;

  // Check if prices must be refreshed.
  if (data.cachebuster == undefined
      || data.cachebuster != currentCacheBuster) {

    // Refresh is already in work, return
    // current prices.
    if (data.cachebuster == 'refresh') {
      return data.prices;
    }

    // Refresh must be done, set a flag to know
    // that the process is launched.
    oldCacheBuster = data.cachebuster;
    data.cachebuster = 'refresh';
    saveData();

    await update();
    return data.prices;
  }
  else {
    return data.prices;
  }
}

/**
 * Helper method to update prices.
 */
async function update() {
  await _update()
    .then(res => {
      let result = undefined;

      // Check result from axios request.

      // Result is set, we can update the
      // local store with new prices.
      if (res != false) {
        result = res;
        data = {
          "cachebuster": currentCacheBuster,
          "prices": res,
        }
      }

      // Result is not set, a problem occurs.
      // we keep the prices with old values
      // and next call maybe will update correctly.
      else {
        result = data.prices;
        data = {
          "cachebuster": oldCacheBuster,
          "prices": result,
        };
      }
      saveData();
      return result;
  });
}

async function _update() {

  // Build list of tokens to request.
  const values = Object.values(requestedTokens);
  let tokens = values.join(',');

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=` + tokens + `&vs_currencies=usd`
    );

    let prices = Object.fromEntries(
      Object.entries(requestedTokens).map(([key, value]) => [key, response.data[value].usd])
    );
    return prices;
  }
  catch (error) {
    return false;
  }
}

function saveData() {
  fs.writeFileSync('data/prices.json', JSON.stringify(data, null, 2));
}

export const PricesRepo = {
  getPrices,
  update,
  getTokenPrice,
};
