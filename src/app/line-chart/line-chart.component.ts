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
  extent,
  InternMap,
  line,
  max,
  min,
  scaleLinear,
  select,
} from 'd3';
import { Selection } from 'd3-selection';
import { Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Line } from 'd3-shape';

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
  set data(data: InternMap[]) {
    this._data = Array.from(data as unknown as Map<number, number>, (d) => {
      return { year: d[0], value: d[1] };
    });
    this._data.sort((a, b) => a.year - b.year);
  }

  private _data: { year: number; value: number }[] = [];

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
  private width = 600;

  /**
   * The height of the svg-canvas. Depends on the available space.
   * @private
   */
  private height = 600;

  private margin = 25;

  private xScale: any;
  private yScale: any;

  ngAfterViewInit() {
    this.width = this.lineChartWrapper?.nativeElement.offsetWidth;
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
    svgInner.selectAll('path').remove();

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
      .domain([40, 50])
      .range([this.height - 2 * this.margin, 0]);
    svgInner
      .append('g')
      .attr('id', 'y-axis')
      .call(axisLeft(this.yScale))
      .style('transform', 'translate(' + this.margin + 'px,  0)');

    const lineGenerator = line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curveMonotoneX);

    const points: [number, number][] = this._data.map((d) => [
      this.xScale(d.year),
      this.yScale(d.value),
    ]);

    svgInner
      .append('path')
      .attr('d', lineGenerator(points))
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '2px');

    // catch mouse events
    svgInner
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('x', this.margin)
      .attr('width', this.width - 2 * this.margin)
      .attr('height', this.height - 2 * this.margin)
      .on('mouseover', this.mouseover.bind(this))
      .on('mousemove', this.mousemove.bind(this))
      .on('mouseout', this.mouseout.bind(this));
  }

  /**
   * Show the tooltip when the mouse is over a shape and restyle the border (stroke) of the current shape.
   *
   * @param event The mouse event to get the current target and therefore the correct shape.
   * @private
   */
  private mouseover(event: MouseEvent) {
    this.tooltip?.style('opacity', 1);
  }

  /**
   * When the mouse move, update the tooltip text with the correct data and set the new position of the tooltip.
   *
   * @param event The mouse event to get the current position of the mouse
   * @param data The feature of the hovered shape from the geojson file
   * @private
   */
  private mousemove(event: MouseEvent) {
    const bisect = bisector(function (d: any) {
      return d.year;
    }).left;

    const x0 = this.xScale.invert(event.x);
    const i = bisect(this._data, x0, 1);
    const selectedData = this._data[i];

    console.log(this.yScale(selectedData?.value));
    this.tooltipData = selectedData;
    this.tooltip
      ?.style('left', this.xScale(selectedData?.year) + 'px')
      .style('top', this.yScale(selectedData?.value) + 225 + 'px');
  }

  /**
   * Hide the tooltip and reset the border (stroke) of the shape when the mouse leaf a municipality.
   *
   * @param event Mouse Event to get the current target of the mouse
   * @private
   */
  private mouseout(event: MouseEvent) {
    // this.tooltip?.style('opacity', 0);
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#' + this.plotId + '-tooltip')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }
}
