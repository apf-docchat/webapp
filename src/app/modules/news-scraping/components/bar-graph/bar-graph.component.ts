import { Component, Input, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-bar-graph',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './bar-graph.component.html',
  styleUrl: './bar-graph.component.less'
})
export class BarGraphComponent {
  @Input() data: any;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: any = {
    chart: {
      type: "column",
      width: 700,
      height: 280,
      backgroundColor: '#f0f8ff5e',
    },
    credits: {
      enabled: false
    },
    title: {
      text: '' // Initialize with empty string
    },
    legend: {
      enabled: false // Show legends
    },
    xAxis: {
      categories: [] // X-axis categories
    },
    yAxis: {
      title: {
        text: null // Y-axis title
      }
    },
    series: [{
      name: 'Series Name', // Series name
      data: [] // Series data
    }]
  };



  ngOnChanges(changes: any) {
    if (changes.data && changes.data.currentValue) {
      const newData = changes.data.currentValue;
      if (newData.title) {
        this.chartOptions.title.text = newData.title;
      }
      if (newData.data && newData.data.labels && newData.data.data_points) {
        this.chartOptions.xAxis.categories = newData.data.labels;
        this.chartOptions.series[0].data = newData.data.data_points;
      }
    }
  }
}
