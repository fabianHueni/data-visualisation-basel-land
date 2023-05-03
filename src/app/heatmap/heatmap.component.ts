import { Component, Input, OnInit } from '@angular/core';
import { axisBottom, axisLeft, scaleBand, scaleLinear, select } from 'd3';
import {
  AGE_GROUPS,
  PopulationService,
} from '../common/service/population.service';
import { PopulationByGroups } from '../common/model/population.interface';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
})
export class HeatmapComponent implements OnInit {
  @Input()
  public id = 2829;
  private data: PopulationByGroups[][] =
    this.popService.getPopulationNumbersAgeGroupsPerMunicipality(this.id);
  private groups = AGE_GROUPS;
  // set the dimensions and margins of the graph
  private margin = { top: 80, right: 25, bottom: 30, left: 60 };
  private width = 1000 - this.margin.left - this.margin.right;
  private height = 1000 - this.margin.top - this.margin.bottom;

  constructor(private popService: PopulationService) {}

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

  // Labels of row and columns
  private myVars = [...new Set(this.groups)];
  private myGroups = [
    ...new Set(
      this.data.map((d) => {
        return `${d[0].year}`;
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
    const data2 = data.flat(2);
    select('#heatmap')
      .selectAll()
      .data(
        data2
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
      .style('opacity', 0.8);
    /*       .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave) */
  }
}
