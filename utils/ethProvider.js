import axios from 'axios';
import {Provider} from 'ethcall';
import { JsonRpcProvider } from '@ethersproject/providers';

/**
 * Get the call provider.
 *
 * @param {JsonRpcProvider} provider
 * @param {Number} chainID
 * @returns Provider
 */
 async function newEthCallProvider(provider, chainID) {
	const	ethcallProvider = new Provider();
	if (chainID === 1337) {
		await	ethcallProvider.init(JsonRpcProvider('http://localhost:8545'));
		ethcallProvider.multicall.address = '0xc04d660976c923ddba750341fe5923e47900cf24';
		return ethcallProvider;
	}
	await	ethcallProvider.init(provider);
	if (chainID === 250) {
		ethcallProvider.multicall.address = '0xc04d660976c923ddba750341fe5923e47900cf24';
	}
	if (chainID === 42161) {
		ethcallProvider.multicall.address = '0x10126Ceb60954BC35049f24e819A380c505f8a0F';
	}
	return	ethcallProvider;
}

/**
 * Get Json rpc provider.
 * @param {Number} network
 * @returns JsonRpcProvider
 */
function getProvider(network) {
  switch (network) {
    case '137' :
    default :
		return new JsonRpcProvider(`https://rpc-mainnet.maticvigil.com/v1/${process.env.POLYGONRPC_APPID}`);
  }
}

export const performGet = (url) => {
	return (
		axios.get(url)
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				console.warn(error);
				return null;
			})
	);
};


/**
 * Fetch a block switch timestamp.
 * @param {Number} timestamp
 * @param {Number} network
 * @returns fetched block.
 */
async function	fetchBlockTimestamp(timestamp, network = 1) {
	if (network === 250) {
		const	result = await performGet(`https://api.ftmscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.FTMSCAN_API}`);

		if (result) {
			return result.result;
		}
		return null;
	}
	if (network === 56) {
		const	result = await performGet(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.BSCSCAN_API}`);

		if (result) {
			return result.result;
		}
		return null;
	}
	if (network === 137) {
		const	result = await performGet(`https://api.polygonscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.POLYGONSCAN_API}`);

		if (result) {
			return result.result;
		}
		return null;
	}
	if (network === 42161) {
		const	result = await performGet(`https://api.arbiscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.ETHERSCAN_API}`);

		if (result) {
			return result.result;
		}
		return null;
	}

	const	result = await performGet(`https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.ETHERSCAN_API}`);

	if (result) {
		return result.result;
	}
	return null;
}


function getWeb3Provider(chain = 1) {
  switch (chain) {
    /*
    case 1 :
      return (`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`);
    */
    case 'polygon' :
    case 137 :
      return (`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_POLYGON}`);
    /*
    case 250 :
      return ('https://rpc.ftm.tools');
    case 56 :
      return ('https://bsc-dataseed1.defibit.io/');
    case 42161 :
      return (`https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_ARBITRUM_KEY}/arbitrum/mainnet`);
    case 1337 :
      return ('http://localhost:8545');
    */
  }
	return (`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`);
}


export const EthProvider = {
  newEthCallProvider,
  getProvider,
  fetchBlockTimestamp,
  getWeb3Provider,
}