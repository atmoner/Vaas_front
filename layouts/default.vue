<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >

      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}  </v-toolbar-title>
      <v-spacer />
        <v-btn
          v-if="!islogged && !isMobile"
          variant="plain"
          size="x-small"
          @click="keplrConnect"
        >
          <img
            src="https://assets.website-files.com/62dbc9b6b1444851f065c74a/62dbc9b6b14448026c65c7fe_Keplr_256.png"
            width="32"
            height="32"
          >
        </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DefaultLayout',
  data () {
    return {
      isMobile: false,
      clipped: true,
      drawer: false,
      fixed: true,
      items: [
        {
          icon: 'mdi-apple-keyboard-command',
          title: 'Dashboard',
          to: '/'
        },
        {
          icon: 'mdi-inbox-arrow-down',
          title: 'Governance',
          to: '/governance'
        }
      ],
      miniVariant: true,
      right: true,
      rightDrawer: false,
      title: 'cros-nest dapp'
    }
  },
  computed: {
    ...mapState('data', ['chainId', 'islogged', 'isForbid']),
  },
  async mounted() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.isMobile = true
    } else {
      this.isMobile = false
    }
  },
  methods: {
    async keplrConnect() {
      await this.$store.dispatch('data/keplrConnect')
      this.miniVariant = false

      if(!this.isForbid)
        await this.$store.dispatch('data/refresh')


    },
    async logout() {
      const store = useDataStore()
      store.addrWallet = ''
      store.nameWallet = ''
      store.txSender = ''
      store.txRecipient = ''
      // store.allProposals = ''
      store.islogged = false
      store.isForbid = false
      store.acountLoaded = false
    },
  },
}
</script>
