<template>
  <b-list-group v-if="topActivities">
    <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="activity in topActivities" :key="`activity-${activity.activityTypeId}`">
      <span>
        <CustomAvatar :id="activity.activityTypeId"
                      :name="activity.activityTypeName"
                      type="activitytype"
                      class="mr-2" />
        <span class="mx-2">{{ activity.activityTypeName }}</span>
      </span>
      <b-badge variant="primary" pill>{{ activity.count }}</b-badge>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import { apiGetParticipantActivityCount } from '@/plugins/api/participant'

export default {
  components: {
    CustomAvatar
  },
  props: {
    participant: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      participantActivityCount: null
    }
  },
  watch: {
    participant: function () {
      this.update()
    }
  },
  computed: {
    topActivities: function () {
      if (this.participantActivityCount) {
        return this.participantActivityCount.slice(0, 5)
      } else {
        return []
      }
    }
  },
  methods: {
    update: function () {
      if (this.participant) {
        apiGetParticipantActivityCount(this.participant.participantId, result => {
          this.participantActivityCount = result
        })
      }
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>
