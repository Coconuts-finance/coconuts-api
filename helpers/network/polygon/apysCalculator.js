import { ethers } from 'ethers';
import	{Contract} from 'ethcall';
import { vaults } from '../../../utils/polygon/vaults/vaults';
import abi from '../../../utils/polygon/abi.json';
import { EthProvider } from '../../../utils/ethProvider';
import { calculateApy } from '../../apyCalculator';
import { PricesRepo } from '../../pricesRepo';

const chunk = (arr, size) => arr.reduce((acc, e, i) => (i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc), []);

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}


async function getApysCalculation() {
  const network = 137;
  let provider = EthProvider.getProvider(network);
  const ethcallProvider = await EthProvider.newEthCallProvider(provider, network);

  const	_calls = [];
	const _vaults = [];

  vaults.forEach(function(vault) {
    if (vault.status !== 'active') {
      return;
    }

    const contract = new Contract(vault.earnContractAddress, abi);

		_calls.push(...[
			contract.apiVersion(),
			contract.depositLimit(),
			contract.totalAssets(),
			contract.availableDepositLimit(),
			contract.pricePerShare(),
			contract.decimals(),
			contract.activation(),
		]);
  });

	const	callResult = await ethcallProvider.all(_calls);
	const	chunkedCallResult = chunk(callResult, 7);
	let	index = 0;

	await asyncForEach(Object.entries(vaults), async ([key, vault]) => {
		/*if (vault.type === 'weird') {
			return;
		}*/
		if ((vault.status !== 'active' && vault.status !== 'new' && vault.status !== 'endorsed')) {
			return;
		}
		//console.log('vault calculator for ' + vault.name);
		const	[
			apiVersion,
			depositLimit,
			totalAssets,
			availableDepositLimit,
			pricePerShare,
			decimals,
			activation
		] = chunkedCallResult[index];

		/*
    console.log('--------------------------');
    console.log('Vault ' + vault.name + ' (' + vault.id + ')');
    console.log('api version ' + apiVersion);
    console.log('deposit limit ' + depositLimit);
    console.log('total assets ' + totalAssets);
    console.log('available deposit limit : ' + availableDepositLimit);
    console.log('price per share : ' + pricePerShare);
    console.log('decimals : ' + decimals);
    console.log('activation : ' + activation);
		*/
		const	dec = Number(decimals);

		const tokenPrice = await PricesRepo.getTokenPrice(vault.token);

		const tvl = Number(ethers.utils.formatUnits(totalAssets, dec));
		const tvlUsd = tvl * tokenPrice;
		let vaultInfo = {
			createdAt: new Date(Number(activation) * 1000).toISOString(),
			updatedAt: new Date(Date.now()).toISOString(),
			_id: vault.id,
			vaultId: vault.id,
			addr: vault.earnContractAddress,
			symbol: vault.token,
			token: vault.tokenAddress,
			tvl: tvl,
			tvlUsd: tvlUsd,
			__v: 0,
			apiVersion: apiVersion,
			//depositLimit: depositLimit,
			//availableDepositLimit: availableDepositLimit,
			//totalAssets: totalAssets,
		}

		// Calculate APY informations.
		if (!vault.mimicApy) {
			const calculation = await calculateApy({
				abi: abi,
				network: network,
				vault: vault,
				pricePerShare: pricePerShare,
				decimals:decimals,
				activation:activation,
			});

			for (const[c, calc] of calculation.entries()) {
				if (calc.status == 'OK') {
					if (calc._day > 0) {
						vaultInfo["apy" + calc._day + "d"] = calc.apy;
					}
					else {
						vaultInfo["apy"] = calc.apy;
					}
				}
			}
		}
		// Get APY informations from another vault.
		else {
			const vs = _vaults.filter(function(v) { return v._id == vault.mimicApy; });
			if (vs.length > 0) {
				const v = vs[0];
				vaultInfo["apy"] = v.apy;
				vaultInfo["apy1d"] = v.apy1d;
				vaultInfo["apy2d"] = v.apy2d;
				vaultInfo["apy3d"] = v.apy3d;
				vaultInfo["apy7d"] = v.apy7d;
			}
		}
		index++;
		_vaults.push(vaultInfo);
  });
	return _vaults;
}

export const ApysCalculator = {
  getApysCalculation,
};