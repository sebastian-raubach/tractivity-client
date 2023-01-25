<template>
  <b-card>
    <b-card-title class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CustomAvatar :id="participant.participantId"
                      :name="participant.participantName"
                      type="participant"
                      :to="{ name: 'participant-details', params: { participantId: participant.participantId } }"
                      class="mr-2" />
        <h2>{{ participant.participantName }}</h2>
      </div>
      <b-form-checkbox switch v-model="isEdit" />
    </b-card-title>

    <b-row>
      <b-col cols=12 md=6 v-for="measure in sortedMeasures" :key="`participant-measure-${measure.activityMeasureId}`">
        <div class="d-flex align-items-center">
          <CustomAvatar :id="measure.measureId"
                        :name="measure.measureName"
                        type="measure"
                        class="mr-2" />
          <h5>{{ measure.measureName }}</h5>
        </div>
        <div class="my-4 d-flex justify-content-between">
          <span>{{ measure.measuredValue }}
          </span>
          <b-button-group v-if="isEdit">
            <b-button size="sm" variant="outline-light" @click="editMeasure(measure)"><BIconPencil /></b-button>
            <b-button size="sm" variant="outline-danger" @click="deleteMeasure(measure)"><BIconTrash /></b-button>
          </b-button-group>
        </div>
      </b-col>
    </b-row>

    <b-button @click="addMeasure" v-if="isEdit"><BIconPlus /> {{ $t('buttonAddMeasure') }}</b-button>

    <AddEditMeasureModal :activityId="activity.activityId" :participantId="participant.participantId" :measureToEdit="selectedMeasure" @change="update" ref="addEditMeasureModal" />
  </b-card>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import AddEditMeasureModal from '@/components/modal/AddEditMeasureModal'

import { BIconPencil, BIconPlus, BIconTrash } from 'bootstrap-vue'
import { apiGetParticipantMeasures, apiDeleteParticipantMeasure } from '@/plugins/api/measure'

export default {
  components: {
    AddEditMeasureModal,
    BIconPencil,
    BIconPlus,
    BIconTrash,
    CustomAvatar
  },
  props: {
    participant: {
      type: Object,
      default: () => {}
    },
    activity: {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
      participantMeasures: [],
      selectedMeasure: null,
      isEdit: false
    }
  },
  computed: {
    sortedMeasures: function () {
      if (this.participantMeasures && this.participantMeasures) {
        return this.participantMeasures.concat().sort((a, b) => a.measureName.localeCompare(b.measureName))
      } else {
        return []
      }
    }
  },
  methods: {
    addMeasure: function () {
      this.selectedMeasure = null

      this.$nextTick(() => this.$refs.addEditMeasureModal.show())
    },
    editMeasure: function (measure) {
      this.selectedMeasure = measure

      this.$nextTick(() => this.$refs.addEditMeasureModal.show())
    },
    deleteMeasure: function (measure) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteMeasureConfirm'), {
        title: this.$t('modalTitleDeleteMeasureConfirm'),
        okTitle: this.$t('buttonYes'),
        cancelTitle: this.$t('buttonNo')
      }).then(value => {
        if (value) {
          apiDeleteParticipantMeasure(measure.activityMeasureId, () => this.update())
        }
      })
    },
    update: function () {
      this.selectedMeasure = null
      apiGetParticipantMeasures(this.activity.activityId, this.participant.participantId, result => {
        this.participantMeasures = result
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
