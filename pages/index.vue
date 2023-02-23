<template>
  <div>
    <v-container v-if="!islogged || (islogged && isForbid)" class="mt-10 fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-card width="800" max-height="400" class="outline-border rounded-xl">
          <v-card-text class="text-h5 d-flex align-center justify-center mt-10 mb-10">
            <span v-if="!isForbid && !isMobile">Keplr login</span><br />
            <span v-if="isForbid">You are not authorised to acces to this app</span>
            <span v-if="isMobile">Please use desktop version</span>
          </v-card-text>
        </v-card>
      </v-row>
    </v-container>

    <v-container v-if="islogged && !isForbid">
      <v-alert v-if="refreshMessage" density="comfortable" type="success" variant="tonal" class="mt-5 ml-5">
        Refreshed!
      </v-alert>

      <v-row v-if="islogged">
        <v-col cols="12">
          <div class="mt-5 ml-5 text-h5">
            <v-sheet class="d-flex mb-6">
              <v-sheet class="ma-2 me-auto">
                {{ validatorInfo.description?.moniker }} Validator Statistics
                <v-btn @click="refresh">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-sheet>
              <div class="text-center">
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" v-bind="attrs" v-on="on">
                      Select chain
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(item, index) in chainActivated" :key="item.name" @click="changeChain(index)">
                      <v-list-item-title>
                        <v-avatar>
                          <v-img :src="item.icon" :alt="item.name"></v-img>
                        </v-avatar>
                        {{ item.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-sheet>
          </div>

          <v-row class="ml-2 mt-4">
            <v-col cols="4">
              <v-card class="outline-border" min-height="180">
                <v-row align="center" justify="center">
                  <v-col cols="4">
                    <v-img class="ma-2" src="https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/osmosis/moniker/osmovaloper1u6jr0pztvsjpvx77rfzmtw49xwzu9kas05lk04.png" cover></v-img>
                  </v-col>
                  <v-col align="center" cols="4">
                    <h3>{{ validatorInfo.description?.moniker }}</h3>
                  </v-col>
                  <v-col align="center" cols="3" class="mr-1">
                    <v-btn class="mb-1" min-width="100" max-height="100" @click="copyToClip">
                      Copy
                    </v-btn>
                    <v-btn class="mb-1" min-width="100" max-height="100" @click="dialogQr = true">
                      Qrcode
                    </v-btn>
                    <v-btn class="mb-1" min-width="100" max-height="100" @click="dialogAuthzAction = true" :disabled="!islogged">
                      Authz
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="4">
              <v-card min-height="180">
                <v-row justify="center">
                  <v-col align="center" cols="4">
                    <v-card-text class="mt-10">
                      <h4 class="mb-2">Token price</h4>
                      <h1>$ {{ Number.parseFloat(tokenPrice).toFixed(2) }}</h1>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card max-height="180">
                <v-row justify="center">
                  <v-col>
                    <v-card-text>
                      <v-simple-table dense>
                        <tbody>
                          <tr>
                            <td>Is jailed</td>
                            <td>{{ validatorInfo.jailed }}</td>
                          </tr>
                          <tr>
                            <td>Voting power</td>
                            <td>{{ validatorInfo.tokens / 1000000 }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</td>
                          </tr>
                          <tr>
                            <td>Security contact</td>
                            <td>{{ validatorInfo.description?.security_contact }}</td>
                          </tr>
                          <tr>
                            <td>Website</td>
                            <td>{{ validatorInfo.description?.website }}</td>
                          </tr>
                        </tbody>
                      </v-simple-table>
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <div v-if="islogged" class="mt-8 ml-5 text-h5">My wallet info ({{ nameWallet }})</div>
          <v-row v-if="islogged" class="ml-2 mt-4">
            <v-col cols="6">
              <v-card class="outline-border">
                <v-card-title>
                  <h4>
                    <v-avatar rounded="0" class="mr-2">
                      <v-icon>mdi-cash</v-icon>
                    </v-avatar>
                    Available
                  </h4>
                </v-card-title>
                <v-card-text style="text-align: end;">
                  <h3>{{ (amountWallet / 1000000).toFixed(2) }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</h3>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card class="outline-border">
                <v-card-title>
                  <h4>
                    <v-avatar rounded="0" class="mr-2">
                      <v-icon>mdi-plus-circle-multiple-outline</v-icon>
                    </v-avatar>
                    Waiting
                  </h4>
                </v-card-title>
                <v-card-text style="text-align: end;">
                  <div v-if="amountReward > 0">
                    <h3 class="text--lighten-1">{{ (amountReward / 1000000).toFixed(4) }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</h3>
                  </div>
                  <div v-else>
                    <h3 class="text--lighten-1">{{ (amountReward / 1000000).toFixed(4) }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</h3>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div v-if="islogged" class="mt-8 ml-5 text-h5">My wallet activity</div>
          <v-row v-if="islogged" class="ml-2 mt-4">
            <v-col cols="6">
              <v-card :class="acountLoaded ? 'outline-border' : 'placeholder-item'" min-height="364">
                <v-card-title>
                  <h4>
                    <v-avatar rounded="0" class="mr-2">
                      <v-icon>mdi-arrow-up-box</v-icon>
                    </v-avatar>
                    Sender
                  </h4>
                </v-card-title>
                <v-card-text>
                  <v-simple-table>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Type
                        </th>
                        <th class="text-left">
                          Tx amount
                        </th>
                        <th class="text-left">
                          Explorer
                        </th>
                        <th class="text-left">
                          Date
                        </th>
                        <th class="text-left">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in txSender" :key="item.txhash">
                        <td>
                          <v-chip class="ma-2" label>
                            {{ item.typeReadable }}
                          </v-chip>
                        </td>
                        <td>{{ item.amount }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</td>
                        <td>
                          <v-btn :href="cosmosConfig[chainSelected].explorerUrl  + item.txhash" target="_blank">
                            <v-icon>mdi-eye-arrow-right-outline</v-icon>
                          </v-btn>
                        </td>
                        <td>{{ item.txDate }} {{ item.txTime }}</td>
                        <td>
                          <v-icon v-if="item.code !== '0'" color="green">mdi-check-bold</v-icon>
                          <v-icon v-else>mdi-close-thick</v-icon>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card :class="acountLoaded ? 'outline-border' : 'placeholder-item'" min-height="364">
                <v-card-title>
                  <h4>
                    <v-avatar rounded="0" class="mr-2">
                      <v-icon>mdi-arrow-down-box</v-icon>
                    </v-avatar>
                    Recipient
                  </h4>
                </v-card-title>
                <v-card-text>
                  <v-simple-table>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Type
                        </th>
                        <th class="text-left">
                          Tx amount
                        </th>
                        <th class="text-left">
                          Explorer
                        </th>
                        <th class="text-left">
                          Date
                        </th>
                        <th class="text-left">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in txRecipient" :key="item.txhash">
                        <td>
                          <v-chip class="ma-2" label>
                            {{ item.typeReadable }}
                          </v-chip>
                        </td>
                        <td>{{ item.amount }} {{ cosmosConfig[chainSelected].coinLookup.viewDenom }}</td>
                        <td>
                          <v-btn :href="cosmosConfig[chainSelected].explorerUrl  + item.txhash" target="_blank">
                            <v-icon>mdi-eye-arrow-right-outline</v-icon>
                          </v-btn>
                        </td>
                        <td>{{ item.txDate }} {{ item.txTime }}</td>
                        <td>
                          <v-icon v-if="item.code !== '0'" color="green">mdi-check-bold</v-icon>
                          <v-icon v-else>mdi-close-thick</v-icon>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-dialog v-model="dialogAuthzAction" max-width="600">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-container fluid>

                  <v-checkbox v-model="select" label="Withdraw Delegator" value="withdrawDelegator"></v-checkbox>
                  <v-checkbox v-model="select" label="Withdraw Validator" value="withdrawValidator"></v-checkbox>
                </v-container>
                <!--<v-combobox
                    v-model="select"
                    :items="items"
                    item-title="title"
                    item-value="val"
                    label="Select a favorite activity or create a new one"
                    multiple
                    return-object
                    chips
                    closable-chips
                  ></v-combobox>-->
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="authzReward">Start</v-btn>
            <v-btn color="primary" @click="dialogAuthzAction = false">Close Dialog</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogQr" max-width="350">
        <v-card>
          <v-card-text>
            <qrcode-vue :value="mainValidator" size="300" level="H" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="dialogQr = false">Close Dialog</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="authzReturn" max-width="350">
        <v-card>
          <v-card-text>
            <div v-if="authzReturnMsg !== ''">
              {{ authzReturnMsg }}
            </div>
            <div else>
              Your tx has been sent!
            </div>
            Tx hash: {{ finalTx }}
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="authzReturn = false">Close Dialog</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!--    <v-btn
      color="primary"
      @click="authzReturn = true"
    >
      Open Dialog
      </v-btn>-->
    </v-container>
  </div>
</template>


<script>
import { mapState } from 'vuex'
import { SigningStargateClient, defaultRegistryTypes } from "@cosmjs/stargate";
import QrcodeVue from 'qrcode.vue'
import bech32 from 'bech32'

import cosmosConfig from '~/cosmos.config'

export default {
  data: () => ({
    isMobile: false,
    drawer: null,
    store: '',
    dialogQr: false,
    dialogAuthzAction: false,
    authzReturn: false,
    authzReturnMsg: '',
    cosmosConfig: cosmosConfig,
    refreshMessage: false,
    finalTx: '',
    links: [
      ['mdi-apple-keyboard-command', 'Dashboard'],
      ['mdi-inbox-arrow-down', 'Governance'],
    ],
        select: [],
        items: [
          { title: 'Withdraw Delegator', val: 'withdrawDelegator' },
          { title: 'Withdraw Validator', val: 'withdrawValidator' }
        ],
  }),
   /* components: {
      QrcodeVue,
    },
    */
  computed: {
    ...mapState('data', [
      'chainSelected',
      'islogged',
      'isForbid',
      'addrWallet',
      'nameWallet',
      'validatorInfo',
      'validatorReward',
      'tokenPrice',
      'amountWallet',
      'amountReward',
      'txSender',
      'txRecipient',
      'acountLoaded',
      'mainValidator',
      'chainActivated'
    ]),
  },
  async mounted() {
    if(this.islogged) {



      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        this.isMobile = true
      } else {
        this.isMobile = false
      }
    }
  },

  methods: {
    async changeChain(chain) {

      console.log('change chain ' + chain)

      await this.$store.dispatch('data/changeChain', chain)
      await this.$store.dispatch('data/keplrConnect')
      await this.$store.dispatch('data/refresh')

      /*const store = useDataStore()
      store.chainSelected = chain
      await store.keplrConnect()
      await store.getWalletTx()
      store.refreshData()
      */
    },
    async refresh() {
       await this.$store.dispatch('data/refresh')
    },
    async copyToClip() {
      navigator.clipboard.writeText(this.mainValidator)
    },
    authzReward() {
      (async () => {
        // const store = useDataStore()
        // const { name, version, addrWallet, nameWallet } = storeToRefs(store)

        const chainId = cosmosConfig[this.chainSelected].chainId;
        await window.keplr.enable(chainId);
        const offlineSigner = await window.getOfflineSignerAuto(chainId);
        const accounts = await offlineSigner.getAccounts();

        const client = await SigningStargateClient.connectWithSigner(
          cosmosConfig[this.chainSelected].rpcURL,
          offlineSigner
        )

        const fee = {
          amount: [
            {
              denom: cosmosConfig[this.chainSelected].coinLookup.chainDenom,
              amount: '5000',
            },
          ],
          gas: '200000',
        }

        const Exec = defaultRegistryTypes[2][1] // MsgExec
        const WithdrawDelegatorReward = defaultRegistryTypes[8][1] // MsgWithdrawDelegatorReward
        const WithdrawValidatorCommission = defaultRegistryTypes[9][1] // MsgWithdrawValidatorCommission


        const copiMsgExe = []
        const foundWithdrawDelegator = this.select.find(element => element === 'withdrawDelegator')
        const foundWithdrawValidator = this.select.find(element => element === 'withdrawValidator')



        if (typeof foundWithdrawDelegator !== 'undefined') {

          const decode = bech32.decode(this.mainValidator)
          const valUserAddr = bech32.encode(cosmosConfig[this.chainSelected].coinLookup.addressPrefix, decode.words)

          copiMsgExe.push({
            typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
            value: WithdrawDelegatorReward.encode(WithdrawDelegatorReward.fromPartial({
              delegatorAddress: valUserAddr,
              validatorAddress: this.mainValidator,
            })).finish()
          })
        }
        if (typeof foundWithdrawValidator !== 'undefined') {
          copiMsgExe.push({
            typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
            value: WithdrawValidatorCommission.encode(WithdrawValidatorCommission.fromPartial({
              validatorAddress: this.mainValidator
            })).finish()
          })
        }
        const MsgExe = {
          typeUrl: "/cosmos.authz.v1beta1.MsgExec",
          value: {
            grantee: this.addrWallet,
              msgs: copiMsgExe
          },
        }

        console.log([MsgExe])
        try {
          const result = await client.signAndBroadcast(this.addrWallet, [MsgExe], fee, '')
          console.log(result)

          if(result.code !== 0) {
            this.authzReturnMsg = result.rawLog
          }

          this.dialogAuthzAction = false
          this.authzReturn = true
          this.finalTx = result.transactionHash
          // store.refreshData()
          await this.$store.dispatch('data/refresh')
        } catch (error) {
          console.error(error)
        }
      })();
    },
  },
}

</script>
<style>

.footerMenu {
  position: absolute;
  bottom: 0px;
  width: 50%;
}

  .tile {
    margin: 15px;
    border-radius: 4px;
    margin-top: 25px;
  }
@keyframes load {
  from {
    left: -150px;
  }
  to {
    left: 100%;
  }
}
</style>

