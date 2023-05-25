import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  axisBottom,
  axisLeft,
  bisector,
  curveMonotoneX,
  line,
  max,
  min,
  pointer,
  scaleLinear,
  select,
} from 'd3';
import { Selection } from 'd3-selection';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { LineChartData, LineChartKey } from './line-chart-data-interface';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements AfterViewInit {
  /**
   * A unique id to identify the svg elements of this component.
   * Necessary to avoid selection conflicts with multiple equal id's.
   */
  readonly plotId = `plot-${uuid()}`;

  /**
   * A reference to the tooltip template. Will be displayed on hover in a wrapped div.
   */
  @Input()
  public tooltipTemplate?: TemplateRef<any>;

  /**
   * The data to display.
   */
  @Input()
  set data(data: Map<LineChartKey, LineChartData[]>) {
    this._data = data;
    this.redraw();
  }

  private _data: Map<LineChartKey, LineChartData[]> = new Map();

  /**
   * A subject to get notified when to redraw the map.
   * Is necessary due to the data changes in the parent component and this component does not know about the data.
   * Especially the color of the shapes needs to be updated.
   */
  @Input()
  public changSubject: Subject<boolean> | undefined;

  /**
   * The wrapper div of this plot. Is needed to get the width and create a responsive plot.
   */
  @ViewChild('lineChartWrapper')
  public lineChartWrapper: ElementRef | undefined;

  /**
   * The data to show in the tooltip of the choropleth.
   */
  public tooltipData: any = null;

  /**
   * The tooltip element in which the tooltip content is displayed.
   * @private
   */
  private tooltip: Selection<any, any, any, any> | undefined;

  /**
   * The width of the svg-canvas. Depends on the available space.
   * @private
   */
  private width = 0;

  /**
   * The height of the svg-canvas. Depends on the available space.
   * @private
   */
  private height = 0;

  private margin = 25;

  private xScale: any;
  private yScale: any;

  ngAfterViewInit() {
    this.width = this.lineChartWrapper?.nativeElement.offsetWidth;
    this.height = this.width / 2;
    this.constructTooltip();
    this.setupLineChart();

    this.changSubject?.subscribe((_) => {
      this.redraw();
    });
  }

  /**
   * Render the initial line chart and set the correct width and size.
   */
  private setupLineChart() {
    select('#' + this.plotId + '-line-chart')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('id', this.plotId + 'line-chart-inner')
      .style(
        'transform',
        'translate(' + this.margin + 'px, ' + this.margin + 'px)'
      );

    this.redraw();
  }

  /**
   * Remove and redraw the full choropleth. We do this when the data is changed in the parent component.
   */
  private redraw() {
    const svgInner = select('#' + this.plotId + 'line-chart-inner');
    svgInner.selectAll('*').remove();

    // add X axis
    this.xScale = scaleLinear()
      .domain([2003, 2022])
      .range([this.margin, this.width - 2 * this.margin]);

    svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style(
        'transform',
        'translate(0, ' + (this.height - 2 * this.margin) + 'px)'
      )
      .call(
        axisBottom(this.xScale)
          .ticks(8)
          .tickFormat((d) => d.toString())
      );

    // add Y axis
    this.yScale = scaleLinear()
      .domain(this.getYDomain())
      .range([this.height - 2 * this.margin, 0]);

    // append y-axis and the horizontal strips to the svg
    svgInner
      .append('g')
      .attr('id', 'y-axis')
      .call(axisLeft(this.yScale))
      .style('transform', 'translate(' + this.margin + 'px,  0)')
      .style('color', '#dddddd')
      .call((g) => g.select('.domain').remove()) // remove vertical line for y-axis
      .call((g) => g.selectAll('.tick text').style('color', '#757575')) // remove vertical line for y-axis
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone() // horizontal lines per y-axis-label
          // the yAxisPadding is added because it is needed to compensate the gap in the left
          .attr('x2', this.width - this.margin - this.margin)
      );

    const lineGenerator = line()
      .x((d) => d[0])
      .y((d) => d[1]);
    // .curve(curveMonotoneX);

    this._data.forEach((value, key) => {
      const points: [number, number][] = value.map((d) => [
        this.xScale(d.year),
        this.yScale(d.value),
      ]);

      svgInner
        .data(this._data)
        .append('path')
        .attr('d', lineGenerator(points))
        .attr('id', 'line')
        .style('fill', 'none')
        .style('stroke', key.color)
        .style('stroke-width', '2px');
    });

    this.addMouseEvents(svgInner);

    // is needed to handle the tooltip and hover indicator properly
    svgInner
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('x', this.margin)
      .attr('width', this.width - 2 * this.margin)
      .attr('height', this.height - 2 * this.margin);
  }

  /**
   * Adds the mouse events, add a hover indicator and handle the the visability and position of the tooltip.
   *
   * @param svg - the svg to add the mouse events to
   * @private
   */
  private addMouseEvents(svg: any) {
    const pointerMoved = (event: any): void => {
      const [xm, ym] = pointer(event);

      // the x value which lies within the dimension
      const year = Math.round(this.xScale.invert(xm));

      const yValues: { label: string; value: number; color: string }[] = [];
      this._data.forEach((value, key) => {
        value
          .filter((d) => d.year === year)
          .map((d) =>
            yValues.push({ label: key.label, value: d.value, color: key.color })
          );
      });

      // remove old hover indicator
      svg.select('#' + 'hover-indicator').remove();

      // append new hover indicator
      svg
        .append('rect')
        .attr('id', 'hover-indicator')
        .attr('x', this.xScale(year))
        .attr('y', 0)
        .attr('height', this.height - 2 * this.margin)
        .attr('width', 2)
        .attr('fill', '#494949')
        .attr('opacity', 0.3)
        // move the rect to the center of the ticks
        .attr('transform', `translate(-1,0)`);

      this.tooltipData = { year: year, value: yValues };

      this.tooltip?.style('display', 'block');

      const tooltipWidth = this.tooltip?.node().getBoundingClientRect().width;
      const tooltipOffset = 12;

      if (window.innerWidth - event.pageX <= tooltipWidth + 3 * tooltipOffset) {
        this.tooltip
          ?.style('left', event.pageX - tooltipWidth - tooltipOffset + 'px')
          .style('top', event.pageY + 'px');
      } else {
        this.tooltip
          ?.style('left', event.pageX + 12 + 'px')
          .style('top', event.pageY + 'px');
      }
    };

    // hover event emitter function is applied here
    svg.on('pointermove', pointerMoved);
    // apply event listener for removing the hover indicator
    // when the user leaves the chart
    svg.on('mouseleave', () => {
      svg.select('#' + 'hover-indicator').remove();
      this.tooltip?.style('display', 'none');
    });
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#' + this.plotId + '-tooltip')
      .style('opacity', 1)
      .style('display', 'none')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }

  /**
   * Get the domain for the y-axis. We use as the domain the min and max value with an appropriated padding.
   * We add 5% padding to the min and max value.
   * @private
   */
  private getYDomain(): number[] {
    const allValues: number[] = [];

    for (const value of this._data.values()) {
      allValues.push(...value.map((d) => d.value));
    }

    return [(min(allValues) ?? 0) * 0.95, (max(allValues) ?? 1) * 1.05];
  }
}
