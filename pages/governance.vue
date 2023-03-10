<template>
  <div>
    <v-row class="ml-2 mt-4">
      <v-col cols="6">
        <v-card class="outline-border">
          <v-card-title>
            <h4>
              <v-avatar rounded="0" class="mr-2">
                <v-icon>mdi-vote-outline</v-icon>
              </v-avatar>
              All props active
            </h4>
          </v-card-title>
          <v-card-text style="text-align: end;">
            <h3>{{ allProposals.length }} props active</h3>
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
              Can be voted
            </h4>
          </v-card-title>
          <v-card-text style="text-align: end;">
            <h3>{{ allProposals.length }} props can be voted</h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="mt-5 ml-5 text-h5">Vote in VOTING PERIOD</div>
    <v-row class="ml-2 mt-4">
      <v-col cols="12">
        <v-card class="outline-border" min-height="364">
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">
                    Id
                  </th>
                  <th class="text-left">
                    Status
                  </th>
                  <th class="text-left">
                    Title
                  </th>
                  <th class="text-left">
                    End voting time
                  </th>
                  <th class="text-left">
                    Vote now
                  </th>
                  <th class="text-left">
                    Voted?
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in finalProps" :key="item.txhash">
                  <!--{{ item }}-->
                  <td>{{ item.proposal_id }}</td>
                  <td>
                    <v-chip class="ma-2" label>
                      VOTING PERIOD
                    </v-chip>
                  </td>
                  <td>{{ item.content.title }}</td>
                  <td>{{ item.voting_end_time }}</td>
                  <td>
                    <v-btn @click="voteToId(item.proposal_id)">
                      <v-icon>mdi-vote-outline</v-icon>
                    </v-btn>
                  </td>
                  
                  <td v-if="item.votedValue">
                    <v-chip v-if="item.votedValue === 'VOTE_OPTION_YES'" color="green" class="ma-2" label>
                      Voted YES
                    </v-chip>
                    <v-chip v-if="item.votedValue === 'VOTE_OPTION_NO'" color="red" class="ma-2" label>
                      Voted NO
                    </v-chip>
                    <v-chip v-if="item.votedValue === 'VOTE_OPTION_NO_WITH_VETO'" color="orange" class="ma-2" label>
                      Voted NO WITH VETO
                    </v-chip>
                    <v-chip v-if="item.votedValue === 'VOTE_OPTION_ABSTAIN'" color="teal" class="ma-2" label>
                      Voted ABSTAIN
                    </v-chip>
                  </td>
                  <td v-else>No vote</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

            <v-dialog
              v-model="dialVote"
              max-width="600px"
            >
              <v-card>
                <v-card-title>
                  <span class="text-h5">Vote for proposal {{ voteFor }}</span>
                </v-card-title>
                <v-card-text>
                <v-form
                  ref="form"
                  v-model="dislableSend"
                  lazy-validation
                >
                  <v-item-group
                    v-model="selected"
                  >
                    <v-container>
                        <v-container fluid>
                          <v-row dense>
                            <v-col
                              class="mx-auto"
                              v-for="card in cardsVote"
                              :key="card.title"
                              :cols="card.flex"
                            >
                            <v-item :value="card" v-slot="{ isSelected, toggle }">
                              <v-card
                                :color="isSelected ? 'primary' : ''"
                                class="d-flex align-center"
                                @click="toggle();"
                              >
                                <v-icon class="ml-4">mdi-vote-outline</v-icon>
                                <v-card-title v-text="card.title"></v-card-title>
                              </v-card>
                              </v-item>
                            </v-col>
                          </v-row>
                        </v-container>
                    </v-container>
                  </v-item-group>
                </v-form>

                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    :disabled="!dislableSend"
                    :loading="loading"
                    color="darken-1"
                    @click="validate"
                  >
                    Send Vote
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import { SigningStargateClient, defaultRegistryTypes } from "@cosmjs/stargate";
import bech32 from 'bech32'
import cosmosConfig from '~/cosmos.config'

export default {
  data: () => ({
    cosmosConfig: cosmosConfig,
    dialVote: false,
    loading: false,
    voteFor: '',
    selected: [],
    dislableSend: true,
    finalProps: '',
      cardsVote: [
        { title: 'Yes', flex: 5 },
        { title: 'No', flex: 5 },
        { title: 'NoWithVeto', flex: 5 },
        { title: 'Abstain', flex: 5 },
      ],
  }),
  computed: {
    ...mapState('data', [
        "islogged",
        "isForbid",
        "addrWallet",
        "nameWallet",
        "allProposals",
        "mainValidator",
        "chainSelected",
        "selectedPrefix"
    ]),
  },
  async beforeMount() {
 
      if (!this.islogged)
        this.$router.push({path: "/"})



    await this.$store.dispatch('data/getAllProposals')
    

  },
  async mounted () {
    console.log(this.allProposals)
    
    let decode = bech32.decode(this.mainValidator)
    const valSmallAddress = bech32.encode(this.selectedPrefix, decode.words)
    let finalProps = await this.allProposals
    finalProps.forEach(async (item) => {
      let checkIsVoted = await axios.get(cosmosConfig[this.chainSelected].apiURL + '/cosmos/gov/v1beta1/proposals/'+item.proposal_id+'/votes/' + valSmallAddress)
      
      item.votedValue = checkIsVoted.data.vote.options[0].option
    });  
    console.log(this.allProposals) 
    this.finalProps = finalProps
  },  
  methods: {
    async voteToId(id) {
      this.dialVote = true
      this.voteFor = id
    },
    async validate () {

        let finalVote
        switch (this.selected.title) {
          case 'Yes':
            finalVote = '1'
            break
          case 'Abstain':
            finalVote = '2'
            break
          case 'No':
            finalVote = '3'
            break
          case 'NoWithVeto':
            finalVote = '4'
            break
          default:
            finalVote = '0'
        }

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
              denom: cosmosConfig[this.chainSelected].chainDenom,
              amount: '5000',
            },
          ],
          gas: '200000',
        }

        const decode = bech32.decode(this.mainValidator)
        const valUserAddr = bech32.encode(cosmosConfig[this.chainSelected].coinLookup.addressPrefix, decode.words)

        const registryVote = defaultRegistryTypes[14][1]
        const voteSend = [{
          typeUrl: "/cosmos.gov.v1beta1.MsgVote",
          value: registryVote.encode(registryVote.fromPartial({
            proposalId: this.voteFor,
            voter: valUserAddr,
            option: finalVote,
          })).finish()
        }]

        const MsgExe = {
          typeUrl: "/cosmos.authz.v1beta1.MsgExec",
          value: {
            grantee: accounts[0].address,
            msgs: voteSend
          },
        }

        try {
          const result = await client.signAndBroadcast(accounts[0].address, [MsgExe], fee, '')
          // console.log(result)
          await this.$store.dispatch('data/getAllProposals')
          this.dialVote = false
        } catch (error) {
            console.error(error)
        }

      },
  },
}
</script>
