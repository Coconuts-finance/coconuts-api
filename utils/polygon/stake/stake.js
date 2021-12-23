export const stakes = [
  {
    id: 'klima-polygon',
    name: 'KLIMA',
    logo: 'single-assets/KLIMA.png',
    token: 'ACUSDC',
    tokenDecimals: 6,
    tokenAddress: '0xB65f32408EbE463248396933CcCe846C06C7a9fC',
    tokenOracle: 'tokens',
    tokenOracleId: 'usd-coin',
    earnedToken: 'KLIMA',
    earnedTokenDecimals: 9,
    earnedTokenAddress: '0x4e78011Ce80ee02d2c3e649Fb657E45898257815',
    earnContractAddress: '0xa1409f29361b600561582c7b337aa22e47f1c88e',
    earnContractAbiName: 'klimaPoolABI',
    earnedOracle: 'tokens',
    earnedOracleId: 'klima-dao',
    partnership: false,
    status: 'active',
    hideCountdown: true,
    partners: [
      {
        logo: 'stake/klima/logo.png',
        background: 'stake/klima/background.png',
        text: `KlimaDAO’s goal is to accelerate the price appreciation of carbon assets. A high price for carbon forces companies and economies to adapt more quickly to the realities of climate change, and makes low-carbon technologies and carbon-removal projects more profitable.
        Through the KLIMA token, we will maximize value creation for our community and create a virtuous cycle of growth. Eventually, the KLIMA token (each backed by real, verified carbon assets) will function as a truly sustainable asset and medium-of-exchange, with real planetary value.`,
        website: 'https://dapp.klimadao.finance',
        social: {
          telegram: 'https://t.me/KlimadaoEN',
          twitter: 'https://twitter.com/KlimaDAO',
        },
      },
    ],
  },
];