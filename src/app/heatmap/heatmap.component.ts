import { Component, OnInit } from '@angular/core';
import { mockData } from './mockData';
import { Data } from '@angular/router';
import { axisBottom, axisLeft, scaleBand, scaleLinear, select } from 'd3';

@Component({
  selector: 'heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
})
export class HeatmapComponent implements OnInit {
  private data: Data[] = mockData;

  // set the dimensions and margins of the graph
  private margin = { top: 80, right: 25, bottom: 30, left: 40 };
  private width = 450 - this.margin.left - this.margin.right;
  private height = 450 - this.margin.top - this.margin.bottom;

  // Labels of row and columns
  private myGroups = [
    ...new Set(
      mockData.map((d) => {
        d.age;
      })
    ),
  ];
  private myVars = [
    ...new Set(
      mockData.map((data) => {
        data.year;
      })
    ),
  ];
  private x = scaleBand()
    .range([0, this.width])
    .domain(`${this.myGroups}`)
    .padding(0.01);
  private y = scaleBand()
    .range([this.height, 0])
    .domain(`${this.myVars}`)
    .padding(0.01);

  private myColor = scaleLinear().range([1, 10]).domain([1, 100]);
  constructor() {}

  ngOnInit() {
    select('#heatmap_viz')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.renderHeatmap();
    this.readData(this.data);
  }

  private renderHeatmap() {
    select('#heatmap_viz')
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(this.x));
    // Build X scales and axis:

    select('#heatmap_viz').append('g').call(axisLeft(this.y));
    // Build color scale
  }

  //Read the data
  private readData(data: Data[]) {
    select('#heatmap_viz')
      .selectAll()
      .data(data, function (d) {
        if (d === undefined) {
          return '';
        }
        return `${d.age} : ${d.count}`;
      })
      .enter()
      .append('rect')
      .attr('x', (d) => {
        return this.x(d.age) ?? '';
      })
      .attr('y', (d) => {
        return this.y(d.count) ?? '';
      })
      .attr('width', this.x.bandwidth())
      .attr('height', this.y.bandwidth())
      .style('fill', (d) => {
        return this.myColor(d.value);
      });
  }
}
