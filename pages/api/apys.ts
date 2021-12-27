import { NextApiRequest, NextApiResponse } from "next";
import { ApysManager } from "../../helpers/apysManager";
import Cors from 'cors';

/**
 * Allowed cors methods.
 */
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
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
  console.log('one');
  // Run the middleware
  await runMiddleware(req, res, cors);
  console.log('two');
  // Exit if method differs from GET.
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return;
  }
  console.log('three');
  // Retrieve query parameters.
  let {network, cachebuster, revalidate} = req.query;
  network = String(network);
  console.log('four : ' + network);
  // Build current timestamp to compare with last access.
	const	now = new Date().getTime();
	const	lastAccess = storeAccess[network] || 0;

	if (lastAccess === 0
      || ((now - lastAccess) > 10 * 60 * 1000)
      || revalidate === 'true'
      || !storeAccess[network]) {

    console.log('revaildate');
    // Retrieve vaults APY's and store it for further requests.
    let data = await ApysManager.getData(network, cachebuster);

    store[network] = data;
    storeAccess[network] = now;
  }
  console.log('response');
  res.setHeader('Cache-Control', 's-maxage=600');
  res.status(200).json(store[network]);
}

export default handler;
