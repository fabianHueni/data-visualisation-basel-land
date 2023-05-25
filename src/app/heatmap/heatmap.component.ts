import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { v4 as uuid } from 'uuid';
import { axisBottom, axisLeft, scaleBand, scaleLinear, select } from 'd3';
import {
  AGE_GROUPS,
  PopulationService,
} from '../common/service/population.service';
import { PopulationByGroups } from '../common/model/population.interface';
import { Selection } from 'd3-selection';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
})
export class HeatmapComponent implements AfterViewInit {
  readonly svgId = `plot-${uuid()}`;

  @Input()
  public set id(id: number) {
    this._id = id;
    this.data = this.popService.getPopulationNumbersAgeGroupsPerMunicipality(
      this._id
    );
    this.max = this.popService.getMax(this.data);
    this.readData(this.data);
  }
  public get id(): number {
    return this._id;
  }
  private _id = 0;
  public tooltipData: any = null;

  @ViewChild('heatmapWrapper')
  public heatmapWrapper: ElementRef | undefined;

  private data: PopulationByGroups[][] =
    this.popService.getPopulationNumbersAgeGroupsPerMunicipality(
      this._id ? this._id : 2829
    );
  public max = 1;
  private groups = AGE_GROUPS;
  private margin = { top: 20, right: 0, bottom: 30, left: 45 };
  private width = 1000 - this.margin.left - this.margin.right;
  private height = 700 - this.margin.top - this.margin.bottom;
  constructor(private popService: PopulationService) {}

  ngAfterViewInit(): void {
    this.width =
      this.heatmapWrapper?.nativeElement.offsetWidth -
      this.margin.left -
      this.margin.right;

    this.constructTooltip();

    this.x = scaleBand()
      .range([0, this.width])
      .domain(this.years)
      .padding(0.05);

    select('#' + this.svgId)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('id', this.svgId + '-heatmap')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.renderHeatmap();
    this.readData(this.data);
    this.max = this.popService.getMax(this.data);
  }

  // Labels of row and columns
  private ageGroups = [...new Set(this.groups)];
  private years = [
    ...new Set(
      this.data.map((d) => {
        return `${d[0].year}`;
      })
    ),
  ];
  private x = scaleBand().range([0, 1200]).domain(this.years).padding(0.05);

  private y = scaleBand()
    .range([this.height, 0])
    .domain(this.ageGroups)
    .padding(0.05); // Zwischenraum zwischen Boxen

  public myColor = scaleLinear<string>()
    .range(['white', '#4a5d75'])
    .domain([0, 0.3 * this.max]);

  private tooltip: Selection<any, any, any, any> | undefined;

  private renderHeatmap() {
    select('#' + this.svgId + '-heatmap')
      .append('g')
      .call(axisBottom(this.x).tickSize(0))
      .style('font-size', 15)
      .attr('transform', 'translate(0,' + this.height + ')')
      .select('.domain')
      .remove();

    select('#' + this.svgId + '-heatmap')
      .append('g')
      .call(axisLeft(this.y).tickSize(0))
      .style('font-size', 15)
      .select('.domain')
      .remove();
  }

  //Read the data
  private readData(data: PopulationByGroups[][]) {
    this.max = this.popService.getMax(this.data);
    this.myColor = scaleLinear<string>()
      .range(['white', '#7491b5'])
      .domain([0, 0.35 * this.max]);

    select('#' + this.svgId + '-heatmap')
      .selectAll()
      .data(data.flat(2))
      .enter()
      .append('rect')
      .attr('x', (d) => {
        return this.x(`${d.year}`) ?? '';
      })
      .attr('y', (d) => {
        return this.y(d.ageGroup) ?? '';
      })
      .attr('width', this.x.bandwidth())
      .attr('height', this.y.bandwidth())
      .style('fill', (d) => {
        return this.myColor(d.population);
      })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
      .on('mouseover', (event: MouseEvent) => {
        this.mouseover(event);
      })
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mousemove(event, data)
      );
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#' + this.svgId + '-tooltip')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }

  /**
   * Show the tooltip when the mouse is over a shape and restyle the border (stroke) of the current shape.
   *
   * @param event The mouse event to get the current target and therefore the correct shape.
   * @private
   */
  private mouseover(event: MouseEvent) {
    this.tooltip?.style('opacity', 1);

    // @ts-ignore
    select(event.currentTarget)
      .style('stroke', 'black')
      .style('stroke-width', 3);
  }

  /**
   * When the mouse move, update the tooltip text with the correct data and set the new position of the tooltip.
   *
   * @param event The mouse event to get the current position of the mouse
   * @param data The feature of the hovered shape from the geojson file
   * @private
   */
  private mousemove(event: MouseEvent, data: any) {
    this.tooltipData = data;
    this.tooltip
      ?.style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY + 'px');
  }

  /**
   * Hide the tooltip and reset the border (stroke) of the shape when the mouse leaf a municipality.
   *
   * @param event Mouse Event to get the current target of the mouse
   * @private
   */
  private mouseleave(event: MouseEvent) {
    this.tooltip?.style('opacity', 0);

    // @ts-ignore
    select(event.currentTarget).style('stroke-width', 0);
  }
}
