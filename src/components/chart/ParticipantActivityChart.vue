<template>
  <div ref="chart" />
</template>

<script>
import { apiGetActivityYears } from '@/plugins/api/activity'
import { apiPostParticipantActivityTable } from '@/plugins/api/participant'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const Plotly = require('plotly.js-dist-min')

export default {
  props: {
    participant: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      minYear: null,
      maxYear: null,
      activities: null
    }
  },
  computed: {
    years: function () {
      if (this.minYear && this.maxYear) {
        return Array.from({ length: this.maxYear - this.minYear + 1 }, (v, k) => this.minYear + k)
      } else {
        return []
      }
    }
  },
  watch: {
    participant: function () {
      this.getParticipantActivities()
    }
  },
  methods: {
    getParticipantActivities: function () {
      apiPostParticipantActivityTable(this.participant.participantId, {
        page: 1,
        limit: MAX_JAVA_INTEGER
      }, result => {
        if (result && result.data) {
          this.activities = result.data
        } else {
          this.activities = []
        }

        this.update()
      })
    },
    toDayOfYear: function (now) {
      const start = new Date(now.getFullYear(), 0, 0)
      const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
      const oneDay = 1000 * 60 * 60 * 24
      return Math.floor(diff / oneDay)
    },
    update: function () {
      Plotly.purge(this.$refs.chart)

      const traces = [{
        x: this.years,
        y: this.years.map(y => this.participant.activityCounts[y] || 0),
        type: 'scatter',
        name: 'Activities'
      }, {
        x: this.years,
        y: this.years.map(y => {
          const a = this.activities.map(a => new Date(a.activityCreatedOn)).filter(a => a.getFullYear() === y).sort((a, b) => b - a).map(a => this.toDayOfYear(a))
          a.unshift(0)

          console.log(y, a)

          let total = 0
          for (let i = 1; i < a.length; i++) {
            total += a[i] - a[i - 1]
          }
          return total / (a.length - 1)
        }),
        yaxis: 'y2',
        type: 'scatter',
        name: 'Days between activities'
      }]

      const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          title: { text: this.$t('chartAxisTime'), font: { color: 'white' } },
          tickfont: { color: 'white' },
          tickmode: 'array',
          tickvals: this.years,
          ticktext: this.years
        },
        height: 400,
        margin: { autoexpand: true },
        autosize: true,
        yaxis: {
          automargin: true,
          title: { text: this.$t('chartAxisParticipantActivity'), font: { color: 'white' } },
          tickfont: { color: 'white' },
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          rangemode: 'tozero'
        },
        yaxis2: {
          automargin: true,
          title: { text: this.$t('chartAxisParticipantActivityFrequency'), font: { color: 'white' } },
          tickfont: { color: 'white' },
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          overlaying: 'y',
          side: 'right',
          rangemode: 'tozero'
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: 'white' }
        },
        hovermode: 'x'
      }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      Plotly.newPlot(this.$refs.chart, traces, layout, config)
    }
  },
  mounted: function () {
    apiGetActivityYears(result => {
      this.minYear = result.min
      this.maxYear = result.max

      this.getParticipantActivities()
    })
  }
}
</script>

<style>

</style>
