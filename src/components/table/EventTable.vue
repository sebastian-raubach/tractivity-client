<template>
  <div>
    <b-table hover
             striped
             responsive
             :fields="fields"
             :items="items"
             no-local-sorting
             selectable
             select-mode="single"
             @row-selected="onRowSelected"
             :sort-by.sync="sortBy"
             :sort-desc.sync="sortDesc">
      <template v-slot:cell(activities)="data">
        <span v-if="data.item.activities">{{ data.item.activities.length }}</span>
      </template>
      <template v-slot:cell(eventParticipants)="data">
        <b-avatar-group>
          <CustomAvatar v-for="participant in getParticipants(data.item)"
                        :key="`event-${data.item.eventId}-participant-${participant.participantId}`"
                        :id="participant.participantId"
                        :name="participant.participantName"
                        v-b-tooltip="participant.participantName"
                        :to="{ name: 'participant-details', params: { participantId: participant.participantId } }"
                        type="participant" />
        </b-avatar-group>
      </template>
    </b-table>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />

    <b-button variant="primary" @click="addEvent"><BIconBookmarkPlus /> {{ $t('buttonAddEvent') }}</b-button>

    <AddEditEventModal :eventToEdit="selectedEvent" ref="eventModal" @change="update" />
  </div>
</template>

<script>
import AddEditEventModal from '@/components/modal/AddEditEventModal'
import CustomAvatar from '@/components/util/CustomAvatar'

import { BIconBookmarkPlus } from 'bootstrap-vue'

export default {
  components: {
    AddEditEventModal,
    BIconBookmarkPlus,
    CustomAvatar
  },
  props: {
    getData: {
      type: Function,
      default: () => {
        return {
          data: {
            data: [],
            count: 0
          }
        }
      }
    }
  },
  data: function () {
    return {
      items: [],
      page: 1,
      perPage: 10,
      totalRows: -1,
      sortBy: null,
      sortDesc: false,
      selectedEvent: null
    }
  },
  watch: {
    page: function () {
      this.update()
    },
    sortBy: function () {
      this.update()
    },
    sortDesc: function () {
      this.update()
    }
  },
  computed: {
    fields: function () {
      return [{
        key: 'eventName',
        sortable: true,
        label: this.$t('tableColumnEventName')
      }, {
        key: 'eventCreatedOn',
        sortable: true,
        label: this.$t('tableColumnEventCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'activities',
        sortable: true,
        label: this.$t('tableColumnEventActivityCount')
      }, {
        key: 'eventParticipants',
        sortable: false,
        label: this.$t('tableColumnEventParticipants')
      }]
    }
  },
  methods: {
    addEvent: function () {
      this.selectedEvent = null
      this.$nextTick(() => this.$refs.eventModal.show())
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
    onRowSelected: function (item) {
      if (item && item.length > 0) {
        this.$emit('event-selected', item[0])
      }
    },
    update: function () {
      this.getData({
        page: this.page,
        limit: this.perPage,
        prevCount: this.totalRows,
        orderBy: this.sortBy,
        ascending: this.sortDesc ? 0 : 1
      })
        .then(result => {
          if (result && result.data) {
            this.items = result.data.data
            this.totalRows = result.data.count
          }
        })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>
