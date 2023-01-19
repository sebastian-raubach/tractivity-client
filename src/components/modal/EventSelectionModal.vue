<template>
  <b-modal :ok-title="$t('buttonCancel')"
           :title="$t('modalTitleSelectEvent')"
           size="xl"
           ok-only
           ref="selectEventModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <EventTable :getData="getData" @event-selected="selectEvent" />
    </b-form>
  </b-modal>
</template>

<script>
import EventTable from '@/components/table/EventTable'

import { apiPostEventTable } from '@/plugins/api/event'

export default {
  components: {
    EventTable
  },
  methods: {
    getData: function (params) {
      return apiPostEventTable(params)
    },
    selectEvent: function (event) {
      this.$emit('event-selected', event)
      this.hide()
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.$nextTick(() => this.$refs.selectEventModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.selectEventModal.hide())
    }
  }
}
</script>

<style>
</style>
