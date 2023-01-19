<template>
  <div>
    <b-table hover
             striped
             responsive
             :fields="fields"
             :items="items"
             no-local-sorting
             :sort-by.sync="sortBy"
             :sort-desc.sync="sortDesc"
             selectable
             select-mode="single"
             @row-selected="onRowSelected">
      <template v-slot:cell(stats)="data">
        <Cartesian :width="200" :height="50" :data="getValues(data.item)">
          <Area animated prop="value" />
          <Tooltip />
        </Cartesian>
      </template>

      <template v-slot:cell(icon)="data">
        <CustomAvatar :id="data.item.participantId"
                      :name="data.item.participantName"
                      type="participant"
                      :searchParams="{ timestamp: apiCallTimestamp }" />
      </template>

      <template v-slot:cell(participantGender)="data">
        <BIconGenderMale v-if="data.item.participantGender === 'male'" />
        <BIconGenderFemale v-else-if="data.item.participantGender === 'female'" />
        <BIconGenderAmbiguous v-else />
      </template>

      <template v-slot:cell(actions)="data">
        <b-button-group>
          <b-button size="sm" @click="editParticipant(data.item)"><BIconPencilSquare /></b-button>
          <b-button size="sm" @click="pickImage(data.item)"><BIconImage /></b-button>
          <b-button size="sm" variant="outline-danger" @click="deleteParticipant(data.item)"><BIconTrash /></b-button>
        </b-button-group>
      </template>
    </b-table>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />

    <b-button variant="primary" @click="addParticipant"><BIconPersonPlus /> {{ $t('buttonAddParticipant') }}</b-button>

    <AddEditParticipantModal :participantToEdit="selectedParticipant" ref="participantModal" @change="update" />
    <ParticipantImageUploadModal :participant="selectedParticipant" ref="participantImageModal" @change="update(true)" />
  </div>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import AddEditParticipantModal from '@/components/modal/AddEditParticipantModal'
import ParticipantImageUploadModal from '@/components/modal/ParticipantImageUploadModal'

import { Cartesian, Area, Tooltip } from 'laue'
import { BIconPencilSquare, BIconPersonPlus, BIconImage, BIconTrash, BIconGenderMale, BIconGenderFemale, BIconGenderAmbiguous } from 'bootstrap-vue'
import { apiGetActivityYears } from '@/plugins/api/activity'
import { apiDeleteParticipant } from '@/plugins/api/participant'

export default {
  components: {
    BIconPencilSquare,
    BIconPersonPlus,
    BIconImage,
    BIconTrash,
    BIconGenderMale,
    BIconGenderFemale,
    BIconGenderAmbiguous,
    AddEditParticipantModal,
    ParticipantImageUploadModal,
    CustomAvatar,
    Cartesian,
    Area,
    Tooltip
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
      date: null,
      apiCallTimestamp: null,
      minYear: null,
      maxYear: null,
      selectedParticipant: null
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
        label: this.$t('tableColumnParticipantIcon')
      }, {
        key: 'participantName',
        sortable: true,
        label: this.$t('tableColumnParticipantName')
      }, {
        key: 'participantDob',
        sortable: true,
        label: this.$t('tableColumnParticipantDob'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'participantGender',
        sortable: false,
        label: this.$t('tableColumnParticipantGender')
      }, {
        key: 'stats',
        sortable: false,
        label: this.$t('tableColumnParticipantStats')
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnParticipantCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'actions',
        sortable: false,
        label: this.$t('tableColumnParticipantActions')
      }]
    }
  },
  methods: {
    onRowSelected: function (item) {
      if (item && item.length > 0) {
        this.$router.push({ name: 'participant-details', params: { participantId: item[0].participantId } })
      }
    },
    pickImage: function (participant) {
      this.selectedParticipant = participant
      this.$nextTick(() => this.$refs.participantImageModal.show())
    },
    editParticipant: function (participant) {
      this.selectedParticipant = participant
      this.$nextTick(() => this.$refs.participantModal.show())
    },
    addParticipant: function () {
      this.selectedParticipant = null
      this.$nextTick(() => this.$refs.participantModal.show())
    },
    deleteParticipant: function (participant) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteParticipantConfirm'), {
        title: this.$t('modalTtitleDeleteParticipantConfirm'),
        okTitle: this.$t('buttonYes'),
        cancelTitle: this.$t('buttonNo')
      }).then(value => {
        if (value) {
          apiDeleteParticipant(participant.participantId, () => this.update(true))
        }
      })
    },
    getValues: function (participant) {
      const result = this.years.map(y => {
        if (participant.activityCounts && participant.activityCounts[y]) {
          return { value: participant.activityCounts[y], name: y }
        } else {
          return { value: 0, name: y }
        }
      })

      return result
    },
    update: function (force = false) {
      this.getData({
        page: this.page,
        limit: this.perPage,
        prevCount: this.totalRows,
        orderBy: this.sortBy,
        ascending: this.sortDesc ? 0 : 1
      })
        .then(result => {
          if (force) {
            this.apiCallTimestamp = Date.now()
          }
          if (result && result.data) {
            this.items = result.data.data
            this.totalRows = result.data.count
          }
        })
    }
  },
  mounted: function () {
    apiGetActivityYears(result => {
      this.minYear = result.min
      this.maxYear = result.max

      this.update()
    })

    this.date = new Date()
  }
}
</script>

<style>

</style>
