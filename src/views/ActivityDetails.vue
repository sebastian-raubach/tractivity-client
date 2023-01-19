<template>
  <section v-if="activity">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="display-3">{{ activity.activityTypeName }}</h1>
      <CustomAvatar :id="activity.activityTypeId"
                    :name="activity.activityTypeName"
                    size="5em"
                    type="activitytype" />
    </div>
    <h5 class="text-muted">
      <BIconCalendar /> {{ new Date(activity.activityCreatedOn).toLocaleDateString() }}
    </h5>

    <hr />

    <b-row v-if="activity.participantMeasures">
      <b-col cols=12 lg=6 class="mb-3" v-for="p in activity.participantMeasures" :key="`participant-${p.participantId}`">
        <ParticipantMeasures :participantMeasures="p" />
      </b-col>
    </b-row>
  </section>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import ParticipantMeasures from '@/components/participant/ParticipantMeasures'

import { apiGetActivity } from '@/plugins/api/activity'
import { BIconCalendar } from 'bootstrap-vue'

export default {
  components: {
    ParticipantMeasures,
    BIconCalendar,
    CustomAvatar
  },
  data: function () {
    return {
      activityId: null,
      activity: null
    }
  },
  methods: {
    update: function () {
      apiGetActivity(this.activityId, result => {
        this.activity = result
      })
    }
  },
  mounted: function () {
    this.activityId = this.$route.params ? this.$route.params.activityId : null
    this.update()
  }
}
</script>

<style>

</style>
