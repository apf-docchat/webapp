import { Component } from '@angular/core';
import { chartData } from '../../../../common/dummyData/dummyData';
import { BarGraphComponent } from '../bar-graph/bar-graph.component';

@Component({
  selector: 'app-list-charts',
  standalone: true,
  imports: [BarGraphComponent],
  templateUrl: './list-charts.component.html',
  styleUrl: './list-charts.component.less'
})
export class ListChartsComponent {

  chartsList = chartData

  ngOnInit() {
  }

}
