import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'tractivity-' + window.location.pathname
}

export default new Vuex.Store({
  state: {
    baseUrl: null,
    token: null,
    locale: 'en_GB'
  },
  getters: {
    storeBaseUrl: (state) => state.baseUrl,
    storeToken: (state) => state.token,
    storeLocale: (state) => state.locale
  },
  mutations: {
    BASE_URL_CHANGED: function (state, newBaseUrl) {
      state.baseUrl = newBaseUrl
    },
    TOKEN_CHANGED: function (state, newToken) {
      state.token = newToken
    },
    LOCALE_CHANGED: function (state, newLocale) {
      state.locale = newLocale
    }
  },
  actions: {
    setBaseUrl: function ({ commit }, baseUrl) {
      commit('BASE_URL_CHANGED', baseUrl)
    },
    setToken: function ({ commit }, token) {
      commit('TOKEN_CHANGED', token)
    },
    setLocale: function ({ commit }, locale) {
      commit('LOCALE_CHANGED', locale)
    }
  },
  plugins: [createPersistedState({
    key: name
  })]
})
