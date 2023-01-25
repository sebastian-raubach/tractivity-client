<template>
  <section v-if="participant">
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="display-3 text-break">{{ participant.participantName }}</h1>
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

    <div class="mb-4" v-if="selectedYear">
      <h2>{{ $t('pageParticipantDetailsActivityHeatmap') }}</h2>

      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityHeatmapYear')" label-for="year">
            <b-form-select id="year" :options="years" v-model="selectedYear" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelActivityType')" label-for="activityType">
            <b-form-select id="activityType" :options="activityTypeOptions" v-model="selectedActivityType" />
          </b-form-group>
        </b-col>
      </b-row>

      <ParticipantActivityHeatmap :participant="participant" :year="selectedYear" :activityTypeId="selectedActivityType" />
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
import ParticipantActivityHeatmap from '@/components/chart/ParticipantActivityHeatmap'

import { apiGetActivityYears, apiGetActivityTypes } from '@/plugins/api/activity'

import { apiGetParticipant, apiGetParticipantActivityCount, apiPostParticipantActivityTable } from '@/plugins/api/participant'

const theYear = new Date().getFullYear()

export default {
  components: {
    ActivityTable,
    CustomAvatar,
    ParticipantActivityHeatmap,
    ParticipantActivityChart,
    ParticipantActivityRanking,
    ParticipantTeamUpRanking
  },
  data: function () {
    return {
      participantId: null,
      participant: null,
      participantActivityCount: null,
      selectedYear: theYear,
      selectedActivityType: null,
      activityTypes: [],
      minYear: theYear,
      maxYear: theYear
    }
  },
  computed: {
    activityTypeOptions: function () {
      let result
      if (this.activityTypes) {
        result = this.activityTypes.map(a => {
          return {
            value: a.id,
            text: a.name
          }
        })
      } else {
        result = []
      }

      result.unshift({ value: null, text: this.$t('formSelectOptionActivityTypeAny') })

      return result
    },
    years: function () {
      if (this.minYear && this.maxYear) {
        return Array.from({ length: this.maxYear - this.minYear + 1 }, (v, k) => this.minYear + k)
      } else {
        return []
      }
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

    apiGetActivityYears(result => {
      this.minYear = result.min
      this.maxYear = result.max

      this.update()
    })

    apiGetActivityTypes(result => {
      this.activityTypes = result
    })
  }
}
</script>

<style>

</style>
