import { ethers } from 'ethers';
import	Web3Contract from	'web3-eth-contract';
import { EthProvider } from '../utils/ethProvider';

/**
 * Calculate the Apy with web3 informations.
 * @param {} param0
 * @returns
 */
async function calculateApy({network, abi, vault, pricePerShare, decimals, activation}) {
  const activationTimestamp = Number(activation);

  const now = new Date(Date.now().valueOf());
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Get the difference in day between today at 00:00 and now.
  const today = (t.valueOf() / 1000).toFixed(0);
  const diff = ((now.valueOf() - t.valueOf()) / 1000 / 60 / 60 / 24);
  //const today = (new Date(Date.now()).valueOf() / 1000).toFixed(0);
  const oneDayAgo = (new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).valueOf() / 1000).toFixed(0);
  const twoDayAgo = (new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).valueOf() / 1000).toFixed(0);
  const threeDayAgo = (new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).valueOf() / 1000).toFixed(0);
  const oneWeekAgo = (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).valueOf() / 1000).toFixed(0);
  const oneMonthAgo = (new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).valueOf() / 1000).toFixed(0);

  const	currentPrice = ethers.utils.formatUnits(pricePerShare, decimals.toNumber());
  //console.log('current price : ' + currentPrice);
  let apy = [
    {day: 'today', _day: 0, timestamp: today, status: ''},
    {day: 'yesterday', _day: 1, timestamp: oneDayAgo, status: ''},
    {day: 'two days ago', _day: 2, timestamp: twoDayAgo, status: ''},
    {day: 'three days ago', _day: 3, timestamp: threeDayAgo, status: ''},
    {day: 'one week ago', _day: 7, timestamp: oneWeekAgo, status: ''},
    {day: 'one month ago', _day: 30, timestamp: oneMonthAgo, status: ''},
  ];
  let counter = 5;
  if (activationTimestamp > oneDayAgo)        counter = 0;
  else if (activationTimestamp > twoDayAgo)   counter = 1;
  else if (activationTimestamp > threeDayAgo) counter = 2;
  else if (activationTimestamp > oneWeekAgo)  counter = 3;
  else if (activationTimestamp > oneMonthAgo) counter = 4;

  let calls = [];

  Web3Contract.setProvider(EthProvider.getWeb3Provider(network));

  for (const[i, currentApyData] of apy.entries()) {
    if (i <= counter) {
      const block = Number(await EthProvider.fetchBlockTimestamp(currentApyData.timestamp, network) || 0);
      calls.push(new Web3Contract(abi, vault.earnContractAddress).methods.pricePerShare().call(undefined, block));
    }
  }

  const data = await Promise.all(calls);
  for (const[i, pricePerShare] of data.entries()) {
    if (i <= counter) {
      apy[i].status = 'OK';
      apy[i].pricePerShare = pricePerShare;

      const price = ethers.utils.formatUnits(pricePerShare, decimals.toNumber());
      apy[i].price = price;

      const roi = (currentPrice / price - 1);
      apy[i].roi = roi;
      apy[i].apy = 0;

      //if (roi) {
        if (apy[i]._day == 0) {
          apy[i].apy = (roi / diff * 365);
          apy[i].readableApy = `${((roi * 100) / diff * 365).toFixed(2)}%`;
        }
        else {
          apy[i].apy = (roi / apy[i]._day * 365);
          apy[i].readableApy = `${((roi * 100) / apy[i]._day * 365).toFixed(2)}%`;
        }
      //}
    }
  }
  return apy;
}

export {calculateApy};
