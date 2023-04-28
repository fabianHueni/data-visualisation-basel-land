import { Component } from '@angular/core';
import * as d3 from 'd3';
import { mockData } from './mockData';
import { Data } from '@angular/router';

@Component({
  selector: 'heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
})
export class HeatmapComponent {
  data: Data[] = mockData;

  // set the dimensions and margins of the graph
  margin = { top: 80, right: 25, bottom: 30, left: 40 };
  width = 450 - this.margin.left - this.margin.right;
  height = 450 - this.margin.top - this.margin.bottom;

  // append the svg object to the body of the page
  svg = d3
    .select('#my_dataviz')
    .append('svg')
    .attr('width', this.width + this.margin.left + this.margin.right)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr(
      'transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')'
    );

  // Labels of row and columns
  myGroups = [
    ...new Set(
      mockData.map((d) => {
        d.age;
      })
    ),
  ];
  myVars = [
    ...new Set(
      mockData.map((data) => {
        data.year;
      })
    ),
  ];
  x = d3
    .scaleBand()
    .range([0, this.width])
    .domain(`${this.myGroups}`)
    .padding(0.01);
  y = d3
    .scaleBand()
    .range([this.height, 0])
    .domain(`${this.myVars}`)
    .padding(0.01);

  myColor = d3.scaleLinear().range([1, 10]).domain([1, 100]);
  constructor() {}

  ngOnInit() {}

  private renderHeatmap() {
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x));
    // Build X scales and axis:
    this.svg.append('g').call(d3.axisLeft(y));
    // Build color scale
  }

  //Read the data
  private readData(data: Data[]) {
    this.svg
      .selectAll()
      .data(data, function (d) {
        if (d === undefined) {
          return '';
        }
        return `${d.age} : ${d.count}`;
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return this.x(d.age);
      })
      .attr('y', function (d) {
        return y(d.count);
      })
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', function (d) {
        return myColor(d.value);
      });
  }
}
