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
  private height = 500 - this.margin.top - this.margin.bottom;

  // Labels of row and columns
  private myVars = [
    ...new Set(
      this.data.map((d) => {
        return d.age;
      })
    ),
  ];
  private myGroups = [
    ...new Set(
      this.data.map((data) => {
        return data.year;
      })
    ),
  ];
  private x = scaleBand()
    .range([0, this.width])
    .domain(this.myGroups)
    .padding(0.05);
  private y = scaleBand()
    .range([this.height, 0])
    .domain(this.myVars)
    .padding(0.05); // Zwischenraum zwischen Boxen

  private myColor = scaleLinear<string>()
    .range(['white', '#69b3a2'])
    .domain([1, 100]);
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

    select('#heatmap_viz').append('g').call(axisLeft(this.y));
  }

  //Read the data
  private readData(data: Data[]) {
    select('#heatmap_viz')
      .selectAll()
      .data(data, function (d) {
        return `${d!.age} : ${d!.age}`;
      })
      .enter()
      .append('rect')
      .attr('x', (d) => {
        return this.x(d.year) ?? '';
      })
      .attr('y', (d) => {
        return this.y(d.age) ?? '';
      })
      .attr('width', this.x.bandwidth())
      .attr('height', this.y.bandwidth())
      .style('fill', (d) => {
        return this.myColor(d.count);
      });
  }
}
