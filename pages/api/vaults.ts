import { NextApiRequest, NextApiResponse } from "next";
import Cors from 'cors';
import { VaultsManager } from "../../helpers/vaultsManager";

/**
 * Allowed cors methods.
 */
const cors = Cors({
  methods: ['GET'],
});

/**
 * Helper method to wait for a middleware to execute before continuing
 * and to throw an error when an error happens in a middleware.
 *
 * @param req
 * @param res
 * @param fn
 * @returns
 */
function runMiddleware(req:NextApiRequest, res:NextApiResponse, fn:any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

/**
 * Store the APY's by network.
 */
const store = {};

/**
 * Store the APY's last access by network.
 */
const storeAccess = {};

/**
 * API Handler.
 *
 * @param req
 * @param res
 * @returns
 */
async function handler(req:NextApiRequest, res:NextApiResponse) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Exit if method differs from GET.
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return;
  }

  // Retrieve query parameters.
  let {network, type, revalidate} = req.query;
  network = String(network);
  if (type == undefined) {
    type = 'vaults';
  }

  if (!storeAccess[network]) {
    storeAccess[network] = {};
  }
  if (!store[network]) {
    store[network] = {};
  }

  // Build current timestamp to compare with last access.
	const	now = new Date().getTime();
	const	lastAccess = storeAccess[network][type] || 0;

	if (lastAccess === 0
      || ((now - lastAccess) > 10 * 60 * 1000)
      || revalidate === 'true'
      || !storeAccess[network][type]) {

    // Retrieve vaults APY's and store it for further requests.
    let data = VaultsManager.getData(network, type);

    store[network][type] = data;
    storeAccess[network][type] = now;
  }
  res.setHeader('Cache-Control', 's-maxage=600');
  res.status(200).json(store[network][type]);
}

export default handler;
