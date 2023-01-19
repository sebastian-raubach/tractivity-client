<template>
  <div ref="chart" />
</template>

<script>
import { apiGetActivityYears } from '@/plugins/api/activity'

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
      maxYear: null
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
      this.update()
    }
  },
  methods: {
    update: function () {
      Plotly.purge(this.$refs.chart)

      const traces = [{
        x: this.years,
        y: this.years.map(y => this.participant.activityCounts[y] || 0),
        type: 'scatter'
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
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: 'white' }
        }
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

      this.update()
    })
  }
}
</script>

<style>

</style>
