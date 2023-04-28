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
  private margin = { top: 80, right: 25, bottom: 30, left: 60 };
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

  // Other Color verion
  /*   private myColor = scaleSequential()
    .interpolator(interpolateInferno)
    .domain([1, 100]); */

  private tooltip = select('#heatmap_canvas')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  constructor() {}

  ngOnInit(): void {
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
      .call(axisBottom(this.x).tickSize(5))
      .style('font-size', 15)
      .attr('transform', 'translate(0,' + this.height + ')');

    select('#heatmap')
      .append('g')
      .call(axisLeft(this.y).tickSize(5))
      .style('font-size', 15);
  }

  //Read the data
  private readData(data: Data[]) {
    select('#heatmap')
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
      })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8);
    /*       .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave) */
  }
}
