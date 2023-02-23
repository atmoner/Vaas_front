export default [
  {
    chainId: 'osmosis-1',
    name: 'Osmosis',
    desc: 'Osmosis is a decentralized peer-to-peer blockchain that people can use to create liquidity and trade IBC enabled tokens.',
    apiURL: 'https://lcd-osmosis.blockapsis.com',
    rpcURL: 'https://rpc.osmosis.zone',
    coinLookup: {
      viewDenom: 'OSMO',
      chainDenom: 'uosmo',
      addressPrefix: 'osmo',
      icon: `https://raw.githubusercontent.com/osmosis-labs/assetlists/main/images/osmo.svg`,
    },
    explorerUrl: 'https://www.mintscan.io/osmosis/txs/',
    coingeckoId: 'osmosis'
  },
  {
    chainId: 'okp4-nemeton-1',
    name: 'OKP4',
    desc: 'OKP4 nemeton testnet.',
    apiURL: 'https://okp4-testnet-api.polkachu.com',
    rpcURL: 'https://okp4-testnet-rpc.polkachu.com',
    coinLookup: {
      viewDenom: 'KNOW',
      chainDenom: 'uknow',
      addressPrefix: 'okp4',
      icon: `https://okp4.explorers.guru/chains/okp4.png`,
    },
    explorerUrl: 'https://okp4.explorers.guru/transaction/',
    coingeckoId: 'bitcanna'
  },
  {
    chainId: "cosmoshub-4",
    name: "Atom",
    apiURL: "https://cosmos-lcd.bitcanna.io",
    rpcURL: "https://cosmos-rpc.bitcanna.io",
    coinLookup: {
      viewDenom: "ATOM",
      chainDenom: "uatom",
      addressPrefix: "cosmos",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
    },
    explorerUrl: 'https://www.mintscan.io/cosmos/txs/',
    coingeckoId: 'cosmos'
  },
]
