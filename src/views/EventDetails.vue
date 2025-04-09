<template>
  <section v-if="event">
    <div class="d-flex align-items-center justify-content-center">
      <h1 class="display-3 text-break">{{ event.eventName }}</h1>
      <b-button @click="$refs.eventModal.show()"><BIconPencil /></b-button>
    </div>

    <hr />

    <div class="mb-3" v-if="event.eventDescription">{{ event.eventDescription }}</div>

    <ActivityTable :getData="getActivities" :eventIdToSelect="eventId" />

    <AddEditEventModal :eventToEdit="event" ref="eventModal" @change="update" />
  </section>
</template>

<script>
import AddEditEventModal from '@/components/modal/AddEditEventModal'
import ActivityTable from '@/components/table/ActivityTable'

import { BIconPencil } from 'bootstrap-vue'
import { apiGetEvent, apiPostEventActivityTable } from '@/plugins/api/event'

export default {
  components: {
    ActivityTable,
    AddEditEventModal,
    BIconPencil
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
    this.eventId = this.$route.params ? +this.$route.params.eventId : null
    this.update()
  }
}
</script>

<style>

</style>
