import axios from 'axios'
import  bech32  from 'bech32'
import cosmosConfig from '~/cosmos.config'

export const state = () => ({
  block: undefined,
  chainSelected: 0,
  selectedPrefix: '',
  islogged: false,
  isForbid: false,
  addrWallet: '',
  nameWallet: '',
  amountWallet: '',
  amountReward: '',
  acountLoaded: false,
  validatorInfo: '',
  validatorReward: '',
  tokenPrice: '',
  txSender: '',
  txRecipient: '',
  allProposals: '',
  mainValidator: '',
  chainActivated: ''
})

export const mutations = {
  // create set methods from data points
  ...Object.fromEntries(
    Object.keys(state()).map((entity) => {
      return [
        `set${entity.charAt(0).toUpperCase()}${entity.substr(1)}`,
        (state, value) => {
          state[entity] = value
        },
      ]
    })
  ),
  resetSessionData(state) {
    state.balances = []
  },
}

export const actions = {
  async refresh({ dispatch, state }) {
    const calls = [
      dispatch('keplrConnect'),

      dispatch('getAccountData'),
      dispatch('getTokenPrice'),
      dispatch('getValData'),
      dispatch('getWalletTx'),
    ]
    await Promise.all(calls)
  },

  async getWalletTx({ commit, state }) {
    let returnTxSender = await axios(
      cosmosConfig[state.chainSelected].apiURL + `/cosmos/tx/v1beta1/txs?events=message.sender=%27` + state.addrWallet + `%27`)
    let returnTxRecipient = await axios(
      cosmosConfig[state.chainSelected].apiURL + `/cosmos/tx/v1beta1/txs?events=transfer.recipient=%27` + state.addrWallet + `%27`)

    var copieTxSender = [];
    var copieTxRecipient = [];

    returnTxSender.data.tx_responses.reverse().slice(0, 5).forEach(function(item) {

      var txDate = new Date(item.timestamp).toLocaleDateString("en-US")
      var txTime = new Date(item.timestamp).toLocaleTimeString("en-US")

      let typeReadable = ''
      let finalAmount = ''
      switch (item.tx.body.messages[0]['@type']) {
        case "/cosmos.bank.v1beta1.MsgSend":
          typeReadable = 'Send'
          finalAmount = item.tx.body.messages[0].amount[0].amount
          break;
        case "/cosmos.staking.v1beta1.MsgDelegate":
          typeReadable = 'Delegate'
          finalAmount = item.tx.body.messages[0].amount.amount
          break;
        case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
          typeReadable = 'Withdraw'
          finalAmount = ''
          break;
        case "/ibc.applications.transfer.v1.MsgTransfer":
          typeReadable = 'IBC'
          finalAmount = item.tx.body.messages[0].token.amount
          break;
        case "/cosmos.authz.v1beta1.MsgExec":
          typeReadable = 'Authz Exec'
          finalAmount = ''
          break;
        case "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn":
          typeReadable = 'Swap'
          finalAmount = ''
          break;
        case "/osmosis.lockup.MsgLockTokens":
          typeReadable = 'Lock Tokens'
          finalAmount = ''
          break;
        case "/osmosis.gamm.v1beta1.MsgJoinPool":
          typeReadable = 'Join Pool'
          finalAmount = ''
          break;
        case "/cosmwasm.wasm.v1.MsgExecuteContract":
          typeReadable = 'Wasm Execute'
          finalAmount = ''
          break;
        case "/cosmwasm.wasm.v1.MsgInstantiateContract":
          typeReadable = 'Wasm Instantiate'
          finalAmount = ''
          break;

        default:
          console.log("Sorry, dont know " + item.tx.body.messages[0]['@type'] + ".");
          typeReadable = 'Unknown'
          finalAmount = ''
          break;
      }

      copieTxSender.push({
        type: item.tx.body.messages[0]['@type'],
        code: item.code,
        typeReadable: typeReadable,
        txhash: item.txhash,
        amount: (finalAmount / 1000000).toFixed(2),
        txDate: txDate,
        txTime: txTime
      })
    });

    returnTxRecipient.data.tx_responses.forEach(function(item) {
      if (item.tx.body.messages[0]['@type'] === '/cosmos.bank.v1beta1.MsgSend') {
        var txDate = new Date(item.timestamp).toLocaleDateString("en-US")
        var txTime = new Date(item.timestamp).toLocaleTimeString("en-US")
        copieTxRecipient.push({
          type: item.tx.body.messages[0]['@type'],
          code: item.code,
          typeReadable: 'Received',
          txhash: item.txhash,
          amount: (item.tx.body.messages[0].amount[0].amount / 1000000).toFixed(2),
          txDate: txDate,
          txTime: txTime
        })
      }
    });

    commit('setTxSender', copieTxSender)
    commit('setTxRecipient', copieTxRecipient.reverse().slice(0, 5))
  },
  async getAccountData({ commit, state }) {
    let amountWallet = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/bank/v1beta1/balances/' + state.addrWallet)
    let amountReward = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/distribution/v1beta1/delegators/' + state.addrWallet + '/rewards')
    let foundamountWallet = amountWallet.data.balances.find(element => element.denom === cosmosConfig[state.chainSelected].coinLookup.chainDenom);
    let foundamountReward = amountReward.data.rewards[0]?.reward.find(element => element.denom === cosmosConfig[state.chainSelected].coinLookup.chainDenom);

    if (typeof foundamountWallet === 'undefined') {
      foundamountWallet = {
        denom: cosmosConfig[state.chainSelected].coinLookup.chainDenom,
        amount: '0'
      }
    }
    if (typeof foundamountReward === 'undefined') {
      foundamountReward = {
        denom: cosmosConfig[state.chainSelected].coinLookup.chainDenom,
        amount: '0'
      }
    }
    commit('setAmountWallet', foundamountWallet.amount)
    commit('setAmountReward', foundamountReward.amount)
  },
  async getTokenPrice({ commit, state }) {
    let tokenPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=' + cosmosConfig[state.chainSelected].coingeckoId + '&vs_currencies=usd')
   // console.log(tokenPrice.data[cosmosConfig[state.chainSelected].coingeckoId].usd)
    commit('setTokenPrice', tokenPrice.data[cosmosConfig[state.chainSelected].coingeckoId].usd)
  },
  async getValData({ commit, state }) {


    let getValData = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/staking/v1beta1/validators/' + state.mainValidator)
    let getValReward = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/distribution/v1beta1/validators/' + state.mainValidator + '/outstanding_rewards')


    commit('setValidatorInfo', getValData.data.validator)
    commit('setValidatorReward', getValReward.data.rewards.rewards[0].amount)
  },
  async getAllProposals({ commit, state }) {
    let getAllProposals = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/gov/v1beta1/proposals?proposal_status=2')

    if (this.islogged) {
      let decode = bech32.decode(this.mainValidator)
      const valSmallAddress = bech32.encode(this.selectedPrefix, decode.words)
      getAllProposals.data.proposals.forEach(async (item) => {
        let checkIsVoted = await axios.get(cosmosConfig[state.chainSelected].apiURL + '/cosmos/gov/v1beta1/proposals/'+item.proposal_id+'/votes/' + valSmallAddress)
        item.votedValue = checkIsVoted.data.vote.options[0].option
      });
    }

    commit('setAllProposals', getAllProposals.data.proposals)
  },
  async changeChain({ commit, dispatch }, chainId) {
    await commit('setChainSelected', Number(chainId))
    dispatch('keplrConnect')
  },
  async keplrConnect({ commit, state, dispatch }) {

    await window.keplr.experimentalSuggestChain({
      chainId: cosmosConfig[state.chainSelected].chainId,
      chainName: cosmosConfig[state.chainSelected].name,
      rpc: cosmosConfig[state.chainSelected].rpcURL,
      rest: cosmosConfig[state.chainSelected].apiURL,
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: cosmosConfig[state.chainSelected].coinLookup.addressPrefix,
        bech32PrefixAccPub: cosmosConfig[state.chainSelected].coinLookup.addressPrefix + "pub",
        bech32PrefixValAddr: cosmosConfig[state.chainSelected].coinLookup.addressPrefix + "valoper",
        bech32PrefixValPub: cosmosConfig[state.chainSelected].coinLookup.addressPrefix + "valoperpub",
        bech32PrefixConsAddr: cosmosConfig[state.chainSelected].coinLookup.addressPrefix + "valcons",
        bech32PrefixConsPub: cosmosConfig[state.chainSelected].coinLookup.addressPrefix + "valconspub",
      },
      currencies: [
        {
          coinDenom: cosmosConfig[state.chainSelected].coinLookup.viewDenom,
          coinMinimalDenom: cosmosConfig[state.chainSelected].coinLookup.chainDenom,
          coinDecimals: 6,
          coinGeckoId: cosmosConfig[state.chainSelected].coingeckoId,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: cosmosConfig[state.chainSelected].coinLookup.viewDenom,
          coinMinimalDenom: cosmosConfig[state.chainSelected].coinLookup.chainDenom,
          coinDecimals: 6,
          coinGeckoId: cosmosConfig[state.chainSelected].coingeckoId,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: cosmosConfig[state.chainSelected].coinLookup.viewDenom,
        coinMinimalDenom: cosmosConfig[state.chainSelected].coinLookup.chainDenom,
        coinDecimals: 6,
        coinGeckoId: cosmosConfig[state.chainSelected].coingeckoId,
      },
  })
    let chainId = cosmosConfig[state.chainSelected].chainId

    await window.keplr.enable(chainId);
    const offlineSigner = await window.getOfflineSignerAuto(chainId);
    const accounts = await offlineSigner.getAccounts();
    const getKey = await window.keplr.getKey(chainId);
    // console.log('addr: '+accounts[0].address)
    commit('setAddrWallet', accounts[0].address)
    commit('setNameWallet', getKey.name)
    dispatch('getAccountData')

    let checkForbiden = await axios.get('/api/auth/' + accounts[0].address)

    let finalValAddress = []
    checkForbiden.data.register?.register.forEach(async (item) => {
      let valPrefix = bech32.decode(item)
      var finalPrefix = valPrefix.prefix.replace('valoper','')
      finalValAddress.push({ prefix: finalPrefix, valaddr: item })
    })

      let chainActivated = []
      cosmosConfig.forEach(async (item) => {
        let foundChain = finalValAddress.find(element => element.prefix === item.coinLookup.addressPrefix);
        if (typeof foundChain !== 'undefined') {
          chainActivated.push({ name: item.name, icon: item.coinLookup.icon })
        }
      })

      const found = finalValAddress.find(element => element.prefix === cosmosConfig[state.chainSelected].coinLookup.addressPrefix);

      if (checkForbiden.data.detail) {
        commit('setIsForbid', true)
      } else {
        commit('setIsForbid', false)
        commit('setMainValidator', found.valaddr)
        commit('setSelectedPrefix', found.prefix)
      }

      commit('setIslogged', true)
      commit('setChainActivated', chainActivated)



  }
}
