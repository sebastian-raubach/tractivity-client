<template>
  <section v-if="event">
    <h1 class="display-3 text-break">{{ event.eventName }}</h1>

    <hr />

    <ActivityTable :getData="getActivities" :eventIdToSelect="eventId" />
  </section>
</template>

<script>
import ActivityTable from '@/components/table/ActivityTable'

import { apiGetEvent, apiPostEventActivityTable } from '@/plugins/api/event'

export default {
  components: {
    ActivityTable
  },
  data: function () {
    return {
      eventId: null,
      event: null
    }
  },
  methods: {
    getActivities: function (params) {
      if (!params.orderBy) {
        params.orderBy = 'activityCreatedOn'
        params.ascending = 0
      }

      return apiPostEventActivityTable(this.eventId, params)
    },
    update: function () {
      apiGetEvent(this.eventId, result => {
        this.event = result
      })
    }
  },
  mounted: function () {
    this.eventId = this.$route.params ? this.$route.params.eventId : null
    this.update()
  }
}
</script>

<style>

</style>
