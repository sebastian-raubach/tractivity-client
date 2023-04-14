<template>
  <div>
    <b-row>
      <b-col cols=12 sm=6 md=4 lg=3 class="mb-3" v-for="event in events" :key="`event-${event.eventId}`">
        <b-card no-body class="h-100">
          <b-card-body>
            <b-card-title>{{ event.eventName }}</b-card-title>
            <b-card-sub-title>
              <small>
                <b-badge v-if="event.latestActivity" variant="light" v-b-tooltip="new Date(event.latestActivity).toLocaleDateString()"><BIconCalendarDate /> {{ formatTimeAgo(event.latestActivity) }}</b-badge>
              </small>
            </b-card-sub-title>

            <b-card-text v-if="event.activities">{{ $tc('widgetEventsActivityCount', event.activities.length) }}</b-card-text>

            <b-avatar-group size="60px">
              <CustomAvatar v-for="participant in getParticipants(event)"
                            :key="`event-${event.eventId}-participant-${participant.participantId}`"
                            :id="participant.participantId"
                            :name="participant.participantName"
                            type="participant"
                            :to="{ name: 'participant-details', params: { participantId: participant.participantId } }"
                            variant="dark"
                            :tooltip="true"
                            v-b-tooltip="participant.participantName" />
            </b-avatar-group>
          </b-card-body>

          <b-button variant="primary" :to="{ name: 'event-details', params: { eventId: event.eventId } }">{{ $t('buttonView') }}</b-button>
        </b-card>
      </b-col>
    </b-row>

    <b-pagination v-if="totalEvents > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalEvents" />

    <b-button variant="primary" @click="$refs.eventModal.show()"><BIconBookmarkPlus /> {{ $t('buttonAddEvent') }}</b-button>

    <AddEditEventModal ref="eventModal" @change="update" />
  </div>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import AddEditEventModal from '@/components/modal/AddEditEventModal'

import { mapGetters } from 'vuex'
import { apiPostEventTable } from '@/plugins/api/event'

import { BIconCalendarDate, BIconBookmarkPlus } from 'bootstrap-vue'

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

export default {
  components: {
    BIconCalendarDate,
    BIconBookmarkPlus,
    CustomAvatar,
    AddEditEventModal
  },
  data: function () {
    return {
      events: [],
      page: 1,
      totalEvents: 0,
      perPage: 8
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeBaseUrl',
      'storeLocale'
    ]),
    formatter: function () {
      return new Intl.RelativeTimeFormat((this.storeLocale || 'en_GB').split('_')[0], {

        numeric: 'always'
      })
    }
  },
  watch: {
    page: function () {
      this.update()
    }
  },
  methods: {
    formatTimeAgo: function (date) {
      let duration = (new Date(date) - new Date()) / 1000

      for (let i = 0; i <= DIVISIONS.length; i++) {
        const division = DIVISIONS[i]
        if (Math.abs(duration) < division.amount) {
          return this.formatter.format(Math.round(duration), division.name)
        }
        duration /= division.amount
      }
    },
    getSrc: function (participant) {
      const result = new URL(`participant/${participant.participantId}/img`, this.storeBaseUrl)
      result.searchParams.append('imageToken', this.storeToken.imageToken)

      if (this.searchParams) {
        Object.keys(this.searchParams).filter(k => this.searchParams[k] !== undefined && this.searchParams[k] !== null).forEach(k => result.searchParams.append(k, this.searchParams[k]))
      }

      return result.href
    },
    getParticipants: function (event) {
      const result = []

      if (event.activities) {
        event.activities.forEach(a => {
          if (a.activityParticipants) {
            a.activityParticipants.forEach(p => {
              if (result.find(r => r.participantId === p.participantId)) {
                return
              }

              result.push(p)
            })
          }
        })
      }

      return result
    },
    update: function () {
      apiPostEventTable({
        page: this.page,
        limit: this.perPage,
        orderBy: 'eventCreatedOn',
        ascending: 0
      }, result => {
        this.events = result.data
        this.totalEvents = result.count
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style scoped>
</style>
