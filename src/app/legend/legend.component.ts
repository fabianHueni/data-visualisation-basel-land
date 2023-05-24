import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';
import { interpolateBlues, select } from 'd3';
import { v4 as uuid } from 'uuid';
import { Subject } from 'rxjs';
import {
  LineChartData,
  LineChartKey,
} from '../line-chart/line-chart-data-interface';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
export class LegendComponent implements AfterViewInit, OnChanges {
  readonly svgId = `legend-${uuid()}`;

  @Input()
  public title = '';

  @Input()
  public min = 0;

  @Input()
  public max = 1;

  @Input()
  public colorScheme = interpolateBlues;

  @Input()
  public lineData: Map<LineChartKey, LineChartData[]> = new Map();

  ngAfterViewInit() {
    this.drawLegend();
  }

  ngOnChanges() {
    this.drawLegend();
  }

  private drawLegend() {
    if (this.lineData.size > 0) {
      this.drawLineChartLegend();
    } else {
      this.drawDiscreteLegend();
    }
  }

  /**
   * Draws a legend to the top right of the choropleth.
   * @private
   */
  private drawDiscreteLegend() {
    // remove already available legend
    select('#' + this.svgId)
      .selectAll('*')
      .remove();

    // legend title
    select('#' + this.svgId)
      .append('text')
      .attr('x', 0)
      .attr('y', 10)
      .text(this.title)
      .style('font-family', 'roboto')
      .style('font-size', ' 14px')
      .attr('text-anchor', 'left');

    // legend items as rectangles
    const size = 20;
    select('#' + this.svgId)
      .attr('width', 300)
      .attr('height', 60)
      .selectAll('legendRect')
      .data([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
      .enter()
      .append('rect')
      .attr('y', 20)
      .attr('x', (d, i) => {
        return i * (size + 2);
      })
      .attr('height', size)
      .attr('width', size)
      .style('fill', (d) => this.colorScheme(d));

    // max label
    select('#' + this.svgId)
      .append('text')
      .attr('x', 0)
      .attr('y', 60)
      .text(this.min)
      .style('font-family', 'roboto')
      .style('font-size', ' 14px')
      .attr('text-anchor', 'left');

    // min label
    select('#' + this.svgId)
      .append('text')
      .attr('x', 10 * (size + 2))
      .attr('y', 60)
      .text(this.max)
      .style('font-size', ' 14px')
      .style('font-family', 'roboto')
      .attr('text-anchor', 'left');
  }

  /**
   * Draws a legend for a line chart with corresponding line items depending on the {@link LegendComponent#lineData}.
   * @private
   */
  private drawLineChartLegend() {
    // remove already available legend
    select('#' + this.svgId)
      .selectAll('*')
      .remove();

    // legend items as line segments
    const legendItemWidth = 150;
    const lineHeight = 4;
    const lineWidth = 25;
    select('#' + this.svgId)
      .attr('width', 500)
      .attr('height', 30)
      .selectAll('legendLine')
      .data(this.lineData.keys())
      .enter()
      .append('rect')
      .attr('y', 14)
      .attr('x', (d, i) => {
        return i * legendItemWidth;
      })
      .attr('height', lineHeight)
      .attr('width', lineWidth)
      .style('fill', (d) => d.color.toString());

    select('#' + this.svgId)
      .selectAll('legendLabel')
      .data(this.lineData.keys())
      .enter()
      .append('text')
      .attr('y', 20)
      .attr('x', (d, i) => {
        return i * legendItemWidth + lineWidth + 5; // 5px padding
      })
      .text((d) => d.label)
      .style('font-family', 'roboto')
      .style('font-size', ' 14px')
      .attr('text-anchor', 'left');
  }
}
