<template>
  <section v-if="participant">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="display-3">{{ participant.participantName }}</h1>
      <CustomAvatar :id="participant.participantId"
                    :name="participant.participantName"
                    type="participant"
                    size="5em" />
    </div>

    <hr />

    <div class="mb-4">
      <h2>{{ $t('pageParticipantDetailsActivityChart') }}</h2>
      <ParticipantActivityChart :participant="participant" />
    </div>

    <div class="mb-4">
      <h2>{{ $t('pageParticipantDetailsActivityHistory') }}</h2>
      <ActivityTable :getData="getActivities" />
    </div>

    <b-row>
      <b-col cols=12 md=6>
        <div class="mb-4">
          <h2>{{ $t('pageParticipantDetailsActivityRanking') }}</h2>
          <ParticipantActivityRanking :participant="participant" />
        </div>
      </b-col>
      <b-col cols=12 md=6>
        <div class="mb-4">
          <h2>{{ $t('pageParticipantDetailsParticipantRanking') }}</h2>
          <ParticipantTeamUpRanking :participant="participant" />
        </div>
      </b-col>
    </b-row>
  </section>
</template>

<script>
import ActivityTable from '@/components/table/ActivityTable'
import CustomAvatar from '@/components/util/CustomAvatar'
import ParticipantActivityChart from '@/components/chart/ParticipantActivityChart'
import ParticipantActivityRanking from '@/components/participant/ParticipantActivityRanking'
import ParticipantTeamUpRanking from '@/components/participant/ParticipantTeamUpRanking'

import { apiGetParticipant, apiGetParticipantActivityCount, apiPostParticipantActivityTable } from '@/plugins/api/participant'

export default {
  components: {
    ActivityTable,
    CustomAvatar,
    ParticipantActivityChart,
    ParticipantActivityRanking,
    ParticipantTeamUpRanking
  },
  data: function () {
    return {
      participantId: null,
      participant: null,
      participantActivityCount: null
    }
  },
  methods: {
    getActivities: function (params) {
      if (!params.orderBy) {
        params.orderBy = 'activityCreatedOn'
        params.ascending = 0
      }

      return apiPostParticipantActivityTable(this.participantId, params)
    },
    update: function () {
      apiGetParticipant(this.participantId, result => {
        this.participant = result
      })
      apiGetParticipantActivityCount(this.participantId, result => {
        this.participantActivityCount = result
      })
    }
  },
  mounted: function () {
    this.participantId = this.$route.params ? this.$route.params.participantId : null
    this.update()
  }
}
</script>

<style>

</style>
