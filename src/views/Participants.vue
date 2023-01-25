<template>
  <div>
    <h1 class="display-3 text-break">{{ $t('pageParticipantsTitle') }}</h1>
    <hr />
    <ParticipantTable :getData="getData" />
  </div>
</template>

<script>
import ParticipantTable from '@/components/table/ParticipantTable'
import { apiPostParticipantTable } from '@/plugins/api/participant'

export default {
  components: {
    ParticipantTable
  },
  methods: {
    getData: function (params) {
      return apiPostParticipantTable(params)
    }
  }
}
</script>

<style>

</style>
