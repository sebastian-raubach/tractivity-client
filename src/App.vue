<template>
  <div>
    <b-navbar toggleable="xl" type="dark" variant="dark" id="main-navigation">
      <button v-b-toggle.sidebar variant="outline-light" id="dataset-selector" class="mr-3 navbar-toggler collapsed"><span class="navbar-toggler-icon" /></button>
      <b-navbar-brand :to="{ name: 'home' }" class="d-flex align-items-center">
        <img src="img/logo.svg" height="40px" class="d-inline-block align-top mr-3" alt="Tractivity">
        Tractivity
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav v-if="storeToken">
        <b-navbar-nav>
          <b-nav-item :to="{ name: 'activities' }"><BIconJournalCheck /> {{ $t('menuActivities') }}</b-nav-item>
          <b-nav-item :to="{ name: 'participants' }"><BIconPeopleFill /> {{ $t('menuParticipants') }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-container class="mt-4">
      <router-view :key="$route.path" />
    </b-container>

    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        <p class="text-muted mt-3" v-if="$t('modalTextLoading')">{{ $t('modalTextLoading') }}</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { loadLanguageAsync } from '@/plugins/i18n'
import { apiCheckToken, apiDeleteToken } from './plugins/api/auth'
import { BIconJournalCheck, BIconPeopleFill } from 'bootstrap-vue'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconJournalCheck,
    BIconPeopleFill
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeToken'
    ])
  },
  data: function () {
    return {
      languages: [{
        locale: 'en_GB',
        name: 'British English',
        icon: '🇬🇧'
      }, {
        locale: 'de_DE',
        name: 'Deutsch - Deutschland',
        icon: '🇩🇪'
      }]
    }
  },
  methods: {
    /**
     * When the locale is changed, update the i18n settings
     * @param language The newly selected locale
     */
    onLocaleChanged: function (language) {
      loadLanguageAsync(language.locale).then(() => {
        this.$i18n.locale = language.locale
        this.$store.dispatch('setLocale', language.locale)
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    },
    logout: function () {
      apiDeleteToken({
        password: this.storeToken.token
      }, () => {
        this.$store.dispatch('setToken', null)
        this.$router.push({ name: 'login' })
      }, {
        codes: [], // Handle all errors by logging out
        callback: () => {
          this.$store.dispatch('setToken', null)
          this.$router.push({ name: 'login' })
        }
      })
    },
    route: function (target) {
      this.$router.push(target)
    }
  },
  created: async function () {
    await apiCheckToken({ token: this.storeToken ? this.storeToken.token : null })
  },
  mounted: function () {
    loadLanguageAsync(this.storeLocale)

    emitter.on('show-loading', this.toggleLoading)
    emitter.on('route', this.route)
  },
  beforeDestroy: function () {
    emitter.off('show-loading', this.toggleLoading)
    emitter.off('route', this.route)
  }
}
</script>

<style lang="scss">
@import '~bootswatch/dist/superhero/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/superhero/bootswatch';
</style>
