<template>
  <b-card>
    <b-card-title class="d-flex align-items-center">
      <CustomAvatar :id="participantMeasures.participantId"
                    :name="participantMeasures.participantName"
                    type="participant"
                    class="mr-2" />
      <h2>{{ participantMeasures.participantName }}</h2>
    </b-card-title>

    <b-row>
      <b-col cols=12 md=6 v-for="measure in sortedMeasures" :key="`participant-${participantMeasures.participantId}-measure-${measure.measuredValue}`">
        <div class="d-flex align-items-center">
          <CustomAvatar :id="measure.measureId"
                        :name="measure.measureName"
                        type="measure"
                        class="mr-2" />
          <h5>{{ measure.measureName }}</h5>
        </div>
        <div class="my-4">{{ measure.measuredValue }}</div>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'

export default {
  components: {
    CustomAvatar
  },
  props: {
    participantMeasures: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    sortedMeasures: function () {
      if (this.participantMeasures && this.participantMeasures.participantMeasures) {
        return this.participantMeasures.participantMeasures.concat().sort((a, b) => a.measureName.localeCompare(b.measureName))
      } else {
        return []
      }
    }
  }
}
</script>

<style>

</style>
