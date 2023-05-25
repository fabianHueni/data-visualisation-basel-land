import { Component, Input } from '@angular/core';
import { axisBottom, axisLeft, max, scaleLinear, select } from 'd3';
import { Population } from '../common/model/population.interface';
import { PopulationService } from '../common/service/population.service';
import { Selection } from 'd3-selection';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
  public years: number[] = [];
  private max = 0;

  private population: Population[] = [];
  private svg: any;
  private margin = 20;
  private width = 1000 - this.margin * 2;
  private height = 750 - this.margin * 2;

  // Create the X-axis band scale
  private x = scaleLinear().domain([-1000, 1000]).range([0, this.width]);

  // Create the Y-axis band scale
  private y = scaleLinear()
    .range([this.height - this.margin, this.margin])
    .domain([0, 100]);

  @Input()
  public set id(id: number) {
    this._id = id;
    this.readData();
  }
  private _id = 0;

  public set selectedYear(year: number) {
    this._selectedYear = year;
    this.readData();
  }
  public _selectedYear = 2022;

  private tooltip: Selection<any, any, any, any> | undefined;
  public tooltipData: any = null;

  constructor(private populationService: PopulationService) {}

  ngOnInit(): void {
    for (let year = 2022; year > 2002; year--) {
      this.years.push(year);
    }
    this.createSvg();
    this.constructTooltip();
    this.readData();
  }

  private readData() {
    console.log(this._id, this._selectedYear);
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    this.population = this.populationService.getPopulationByYearAndMunicipality(
      this._selectedYear,
      this._id
    );
    console.log(this.population);
    const maxPopulation = max(this.population.map((entry) => entry.population));
    this.max = maxPopulation ? maxPopulation : 0;
    this.x = scaleLinear()
      .domain([-this.max, this.max])
      .range([this.margin, this.width - this.margin]);
    this.drawBars(this.population);
  }

  private createSvg(): void {
    this.svg = select('#histogram_canvas')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('id', 'histogram')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private drawBars(data: Population[]): void {
    // Draw the X-axis on the DOM
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(
        axisBottom(this.x)
          .tickSize(0)
          .tickFormat((d) => Math.abs(d as number).toString())
      )
      .select('.domain')
      .remove()
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Draw the Y-axis on the DOM
    this.svg
      .append('g')
      .call(axisLeft(this.y).tickSize(0).ticks(20))
      .select('.domain')
      .remove();

    this.drawBarsM(data);
    this.drawBarsF(data);
  }
  private drawBarsM(data: Population[]): void {
    data = data.filter((d) => d.sex === 1);

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', this.x(0))
      .attr('y', (d: Population) => this.y(d.age))
      .attr('width', (d: Population) => this.x(d.population) - this.x(0))
      .attr('height', (d: Population) => this.height / 100)
      .attr('fill', '#6A82DF')
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

  private drawBarsF(data: Population[]): void {
    data = data.filter((d) => d.sex === 2);

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar negative')
      .attr('x', (d: Population) => this.x(-d.population))
      .attr('y', (d: Population) => this.y(d.age))
      .attr('width', (d: Population) => this.x(0) - this.x(-d.population))
      .attr('height', this.height / 100)
      .attr('fill', 'pink')
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
    this.tooltip = select('#histogram')
      .style('opacity', 1)
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
      .style('stroke-width', 1);
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
    this.tooltip?.style('opacity', 1);

    // @ts-ignore
    select(event.currentTarget).style('stroke-width', 0);
  }
}
