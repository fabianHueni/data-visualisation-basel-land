import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select } from 'd3';
import {
  Population,
  PopulationByGroups,
} from '../common/model/population.interface';
import {
  AGE_GROUPS,
  AGE_GROUPS_10,
  PopulationService,
} from '../common/service/population.service';
import { Selection } from 'd3-selection';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements AfterViewInit {
  readonly plotId = `plot-${uuid()}`;
  public years: number[] = [];

  /**
   * The wrapper div of this plot. Is needed to get the width and create a responsive plot.
   */
  @ViewChild('histogramWrapper')
  public histogramWrapper: ElementRef | undefined;

  private max = 0;
  private population: Population[] = [];
  private populationByGroups: PopulationByGroups[] = [];
  private svg: any;
  private margin = 20;
  private width = 1000 - this.margin * 2;
  private height = 750 - this.margin * 2;
  private ageGroup: string[] = [];

  // Create the X-axis band scale
  private x = scaleLinear().domain([-1000, 1000]).range([0, this.width]);

  // Create the Y-axis band scale
  private y = scaleLinear()
    .range([this.height - this.margin, this.margin])
    .domain([0, 100]);
  // y when ageGroups are displayed
  private yGroup = scaleBand()
    .range([this.height - this.margin, this.margin])
    .domain(this.ageGroup);

  @Input()
  public set id(id: number) {
    this._id = id;
    this.selectedAgeGroup = 0;
    this.readData();
  }
  private _id = 0;

  public set selectedYear(year: number) {
    this._selectedYear = year;
    this.loadData();
  }
  private _selectedYear = 2022;

  public set selectedAgeGroup(ageGroup: number) {
    this._selectedAgeGroup = ageGroup;
    this.loadData();
  }
  public get selectedAgeGroup() {
    return this._selectedAgeGroup;
  }
  private _selectedAgeGroup = 0;

  private tooltip: Selection<any, any, any, any> | undefined;
  public tooltipData: any = null;

  public ageGroups = [
    { label: 'Alle', value: 0 },
    { label: '5 Jahresgruppen', value: 1 },
    { label: '10 Jahresgruppen', value: 2 },
  ];

  constructor(private populationService: PopulationService) {}

  ngAfterViewInit(): void {
    this.width =
      this.histogramWrapper?.nativeElement.offsetWidth - this.margin * 2;

    for (let year = 2022; year > 2002; year--) {
      this.years.push(year);
    }
    this.createSvg();
    this.constructTooltip();
    this.loadData();
  }

  private readData() {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();
    this.population = this.populationService.getPopulationByYearAndMunicipality(
      this._selectedYear,
      this._id
    );
    const maxPopulation = max(this.population.map((entry) => entry.population));
    this.max = maxPopulation ? maxPopulation : 0;
    this.x = scaleLinear()
      .domain([-this.max, this.max])
      .range([this.margin, this.width - this.margin]);
    this.drawBars(this.population);
  }

  private readDataAgeGroups() {
    this.svg.selectAll('*').remove();
    const maxPopulation = max(
      this.populationByGroups.map((entry) => entry.population)
    );
    this.max = maxPopulation ? maxPopulation : 0;
    this.x = scaleLinear()
      .domain([-this.max, this.max])
      .range([this.margin + 10, this.width - this.margin - 10]);
    this.yGroup = scaleBand()
      .range([this.height - this.margin, this.margin])
      .domain(this.ageGroup)
      .padding(0.05);
    this.drawBarsGroups();
  }

  private loadData() {
    switch (this._selectedAgeGroup) {
      case 1: {
        this.populationByGroups =
          this.populationService.getPopulationByYearAndMunicipality5YearAgeGroup(
            this._selectedYear,
            this._id
          );
        this.ageGroup = AGE_GROUPS;
        this.readDataAgeGroups();
        break;
      }
      case 2: {
        this.populationByGroups =
          this.populationService.getPopulationByYearAndMunicipality10YearAgeGroup(
            this._selectedYear,
            this._id
          );
        this.ageGroup = AGE_GROUPS_10;
        this.readDataAgeGroups();
        break;
      }
      default: {
        this.readData();
      }
    }
  }

  private createSvg(): void {
    this.svg = select('#' + this.plotId + '-histogram')
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
      .attr('height', this.height / 100 - 1)
      .attr('fill', '#6A82DF')
      .on('mouseover', (event: MouseEvent, data: any) => {
        this.mouseHover(event, data);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mouseHover(event, data)
      )
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      });
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
      .attr('height', this.height / 100 - 1)
      .attr('fill', 'pink')
      .on('mouseover', (event: MouseEvent, data: any) => {
        this.mouseHover(event, data);
      })
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mouseHover(event, data)
      );
  }

  private drawBarsGroups(): void {
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
      .call(axisLeft(this.yGroup).tickSize(0))
      .attr('transform', 'translate(10,0)')
      .select('.domain')
      .remove();
    this.drawBarsMGroup();
    this.drawBarsFGroup();
  }

  private drawBarsMGroup(): void {
    const data = this.populationByGroups.filter((d) => d.sex === 1);
    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', this.x(0))
      .attr('y', (d: PopulationByGroups) => this.yGroup(d.ageGroup))
      .attr(
        'width',
        (d: PopulationByGroups) => this.x(d.population) - this.x(0)
      )
      .attr('height', this.yGroup.bandwidth())
      .attr('fill', '#6A82DF')
      .on('mouseover', (event: MouseEvent, data: any) => {
        this.mouseHover(event, data);
      })
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mouseHover(event, data)
      );
  }

  private drawBarsFGroup(): void {
    const data = this.populationByGroups.filter((d) => d.sex === 2);

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar negative')
      .attr('x', (d: PopulationByGroups) => this.x(-d.population))
      .attr('y', (d: PopulationByGroups) => this.yGroup(d.ageGroup))
      .attr(
        'width',
        (d: PopulationByGroups) => this.x(0) - this.x(-d.population)
      )
      .attr('height', this.yGroup.bandwidth())
      .attr('fill', 'pink')
      .on('mouseover', (event: MouseEvent, data: any) => {
        this.mouseHover(event, data);
      })
      .on('mouseout', (event: MouseEvent) => {
        this.mouseleave(event);
      })
      .on('mousemove', (event: MouseEvent, data: any) =>
        this.mouseHover(event, data)
      );
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#' + this.plotId + '-tooltip')
      .style('display', 'none')
      .style('opacity', 1)
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }

  /**
   * When the mouse move, update the tooltip text with the correct data and set the new position of the tooltip.
   *
   * @param event The mouse event to get the current position of the mouse
   * @param data The feature of the hovered shape from the geojson file
   * @private
   */
  private mouseHover(event: MouseEvent, data: any) {
    // @ts-ignore
    select(event.currentTarget)
      .style('stroke', 'black')
      .style('stroke-width', 1);

    this.tooltipData = data;
    this.tooltip?.style('display', 'block');
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
    this.tooltip?.style('display', 'none');

    // @ts-ignore
    select(event.currentTarget).style('stroke-width', 0);
  }
}
