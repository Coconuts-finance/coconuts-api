import { NextApiRequest, NextApiResponse } from "next";
import { PricesRepo } from "../../helpers/pricesRepo";
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
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

async function handler(req:NextApiRequest, res:NextApiResponse) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return;
  }
  const query = req.query;
  //const body = JSON.parse(req.body);
  //const ids = body.ids;

  return new Promise<void>((resolve, reject) => {
    PricesRepo.getPrices(query.cachebuster)
    .then(response => {
      response['TEST'] = 0;
      res.status(200).json(response);
      resolve();
    })
    .catch(error => {
      res.json(error);
      res.status(405).end();
    });
  });
}

export default handler;
