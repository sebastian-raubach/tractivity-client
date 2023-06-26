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
      <template v-slot:cell(icon)="data">
        <CustomAvatar :id="data.item.activityTypeId"
                      :name="data.item.activityTypeName"
                      type="activitytype" />
      </template>

      <template v-slot:cell(participants)="data">
        <b-avatar-group>
          <CustomAvatar v-for="participant in data.item.participants"
                        :key="`activity-${data.item.activityId}-participant-${participant.participantId}`"
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

    <b-button variant="primary" @click="addActivity"><BIconJournalPlus /> {{ $t('buttonAddActivity') }}</b-button>

    <AddEditActivityModal :eventIdToSelect="eventIdToSelect" :preferredLocation="preferredLocation" :activityToEdit="selectedActivity" ref="activityModal" @change="update" />
  </div>
</template>

<script>
import AddEditActivityModal from '@/components/modal/AddEditActivityModal'
import CustomAvatar from '@/components/util/CustomAvatar'

import { BIconJournalPlus } from 'bootstrap-vue'

export default {
  components: {
    AddEditActivityModal,
    CustomAvatar,
    BIconJournalPlus
  },
  props: {
    eventIdToSelect: {
      type: Number,
      default: null
    },
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
      selectedActivity: null
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
    preferredLocation: function () {
      if (!this.selectedActivity && this.items && this.items.length > 0) {
        return this.items.concat().sort((a, b) => a.createdOn - b.createdOn)[0].locationId
      } else {
        return null
      }
    },
    years: function () {
      if (this.minYear && this.maxYear) {
        return Array.from({ length: this.maxYear - this.minYear + 1 }, (v, k) => this.minYear + k)
      } else {
        return []
      }
    },
    fields: function () {
      return [{
        key: 'icon',
        sortable: false,
        label: this.$t('tableColumnActivityIcon')
      }, {
        key: 'activityTypeName',
        sortable: true,
        label: this.$t('tableColumnActivityTypeName')
      }, {
        key: 'locationName',
        sortable: true,
        label: this.$t('tableColumnLocationName')
      }, {
        key: 'participants',
        sortable: false,
        label: this.$t('tableColumnActivityParticipants')
      }, {
        key: 'activityCreatedOn',
        sortable: true,
        label: this.$t('tableColumnActivityCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'eventName',
        sortable: true,
        label: this.$t('tableColumnEventName')
      }, {
        key: 'eventCreatedOn',
        sortable: true,
        label: this.$t('tableColumnEventCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }]
    }
  },
  methods: {
    addActivity: function () {
      this.selectedActivity = null
      this.$nextTick(() => this.$refs.activityModal.show())
    },
    onRowSelected: function (item) {
      if (item && item.length > 0) {
        this.$router.push({ name: 'activity-details', params: { activityId: item[0].activityId } })
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
