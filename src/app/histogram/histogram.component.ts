import { Component } from '@angular/core';
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select } from 'd3';
import { PopulationBySex } from '../common/model/population.interface';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
  private population: PopulationBySex[] = [
    { sex: 0, age: 1, year: 2003, population: 10 },
    { sex: 0, age: 2, year: 2003, population: 20 },
    { sex: 0, age: 3, year: 2003, population: 30 },
    { sex: 0, age: 4, year: 2003, population: 40 },
    { sex: 1, age: 1, year: 2003, population: 15 },
    { sex: 1, age: 2, year: 2003, population: 25 },
    { sex: 1, age: 3, year: 2003, population: 35 },
    { sex: 1, age: 4, year: 2003, population: 45 },
  ];
  private svg: any;
  private margin = 50;
  private width = 750 - this.margin * 2;
  private height = 400 - this.margin * 2;

  // Create the X-axis band scale
  private x = scaleLinear().domain([-50, 50]).range([0, this.width]);
  //.tickFormat((d: number) =>{return `${Math.abs(d)}`});

  // Create the Y-axis band scale
  private y = scaleBand()
    .range([0, this.height])
    .domain(
      this.population.map(function (p) {
        return `${p.age}`;
      })
    )
    .padding(0.1);

  ngOnInit(): void {
    this.createSvg();
    this.drawBars(this.population);
  }

  private createSvg(): void {
    this.svg = select('#histogram_canvas')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private drawBars(data: PopulationBySex[]): void {
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
      .attr('transform', 'translate(' + this.x(1) + ',0)')
      .call(axisLeft(this.y).tickSize(0))
      .select('.domain')
      .remove();

    this.drawBarsM(data);
    this.drawBarsF(data);
  }
  private drawBarsM(data: PopulationBySex[]): void {
    data = data.filter((d) => d.sex == 0);

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', this.x(5))
      .attr('y', (d: PopulationBySex) => this.y(`${d.age}`))
      .attr(
        'width',
        (d: PopulationBySex) => this.x(d.population - 5) - this.x(0)
      )
      .attr('height', (d: PopulationBySex) => this.y.bandwidth())
      .attr('fill', 'blue');
  }

  private drawBarsF(data: PopulationBySex[]): void {
    data = data.filter((d) => d.sex == 1);

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar negative')
      .attr('x', (d: PopulationBySex) => this.x(-d.population))
      .attr('y', (d: PopulationBySex) => this.y(`${d.age}`))
      .attr('width', (d: PopulationBySex) => this.x(-5) - this.x(-d.population))
      .attr('height', (d: PopulationBySex) => this.y.bandwidth())
      .attr('fill', 'pink');
  }
}
