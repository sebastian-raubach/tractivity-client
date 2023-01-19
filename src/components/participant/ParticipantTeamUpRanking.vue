<template>
  <b-list-group v-if="topParticipants">
    <b-list-group-item class="d-flex justify-content-between align-items-center"
                       v-for="participant in topParticipants"
                       :key="`participant-${participant.participantId}-participant-${participant.participantId}`"
                       :to="{ name: 'participant-details', params: { participantId: participant.participantId } }">
      <span>
        <CustomAvatar :id="participant.participantId"
                      :name="participant.participantName"
                      type="participant"
                      class="mr-2" />
        <span class="mx-2">{{ participant.participantName }}</span>
        <span>
          <BIconGenderMale v-if="participant.participantGender === 'male'" />
          <BIconGenderFemale v-else-if="participant.participantGender === 'female'" />
          <BIconGenderAmbiguous v-else />
        </span>
      </span>
      <b-badge variant="primary" pill>{{ participant.count }}</b-badge>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import CustomAvatar from '@/components/util/CustomAvatar'
import { apiGetParticipantParticipantCount } from '@/plugins/api/participant'
import { BIconGenderMale, BIconGenderFemale, BIconGenderAmbiguous } from 'bootstrap-vue'

export default {
  components: {
    CustomAvatar,
    BIconGenderMale,
    BIconGenderFemale,
    BIconGenderAmbiguous
  },
  props: {
    participant: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      participantParticipantCount: null
    }
  },
  watch: {
    participant: function () {
      this.update()
    }
  },
  computed: {
    topParticipants: function () {
      if (this.participantParticipantCount) {
        return this.participantParticipantCount.slice(0, 5)
      } else {
        return []
      }
    }
  },
  methods: {
    update: function () {
      if (this.participant) {
        apiGetParticipantParticipantCount(this.participant.participantId, result => {
          this.participantParticipantCount = result
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
