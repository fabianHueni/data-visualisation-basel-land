import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
export class HeatmapComponent implements OnInit {
  @Input()
  public id = 2865;

  public tooltipData: any = null;
  private data: PopulationByGroups[][] =
    this.popService.getPopulationNumbersAgeGroupsPerMunicipality(this.id);
  private groups = AGE_GROUPS;
  // set the dimensions and margins of the graph
  private margin = { top: 80, right: 25, bottom: 30, left: 60 };
  private width = 1000 - this.margin.left - this.margin.right;
  private height = 500 - this.margin.top - this.margin.bottom;

  @ViewChild('heatmapWrapper')
  public heatmapWrapper: ElementRef | undefined;

  constructor(private popService: PopulationService) {}

  ngOnInit(): void {
    this.width =
      this.heatmapWrapper?.nativeElement.offsetWidth -
      this.margin.left -
      this.margin.right;

    this.constructTooltip();

    select('#heatmap_canvas')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('id', 'heatmap')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.renderHeatmap();
    this.readData(this.data);
  }

  // Labels of row and columns
  private myVars = [...new Set(this.groups)];
  private myGroups = [
    ...new Set(
      this.data.map((d) => {
        return `${d[0].year}`;
      })
    ),
  ];
  private x = scaleBand().range([0, 1200]).domain(this.myGroups).padding(0.05);

  private y = scaleBand()
    .range([this.height, 0])
    .domain(this.myVars)
    .padding(0.05); // Zwischenraum zwischen Boxen

  private myColor = scaleLinear<string>()
    .range(['white', '#69b3a2'])
    .domain([0, 20]);

  // Other Color verion
  /*   private myColor = scaleSequential()
    .interpolator(interpolateInferno)
    .domain([1, 100]); */

  private tooltip: Selection<any, any, any, any> | undefined;

  // Three function that change the tooltip when user hover / move / leave a cell
  /*   public mouseover(event: MouseEvent) {
    this.tooltip
      .style('opacity', 1)
      // @ts-ignore
      .select(event.currentTarget)
      .style('stroke', 'black')
      .style('opacity', 1);
  }

  public mousemove(event: MouseEvent, d: any) {
    this.tooltip
      .html(d.count)
      .style('left', mouse(this)[0] + 70 + 'px')
      .style('top', mouse(this)[1] + 'px');
  }

  public mouseleave(event: MouseEvent, d: any) {
    this.tooltip.style('opacity', 0);
    // @ts-ignore
    select(event.currentTarget).style('stroke', 'none').style('opacity', 0.8);
  } */

  private renderHeatmap() {
    select('#heatmap')
      .append('g')
      .call(axisBottom(this.x).tickSize(0))
      .style('font-size', 15)
      .attr('transform', 'translate(0,' + this.height + ')')
      .select('.domain')
      .remove();

    select('#heatmap')
      .append('g')
      .call(axisLeft(this.y).tickSize(0))
      .style('font-size', 15)
      .select('.domain')
      .remove();
  }

  //Read the data
  private readData(data: PopulationByGroups[][]) {
    select('#heatmap')
      .selectAll()
      .data(
        data.flat(2)
        // return `${d![0].ageGroup} : ${d![0].ageGroup}`;
      )
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
    this.tooltip = select('#tooltip')
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
    console.log(this.tooltipData);
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
