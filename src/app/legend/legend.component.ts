import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';
import { interpolateBlues, select } from 'd3';
import { v4 as uuid } from 'uuid';
import { Subject } from 'rxjs';

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

  ngAfterViewInit() {
    this.drawLegend();
  }

  ngOnChanges() {
    this.drawLegend();
  }

  /**
   * Draws a legend to the top right of the choropleth.
   * @private
   */
  private drawLegend() {
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
}