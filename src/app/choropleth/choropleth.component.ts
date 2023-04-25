import { AfterViewInit, Component } from '@angular/core';
import { GeoPath } from 'd3-geo';
import { mapData } from './map-data';
import { geoPath, geoTransform, InternMap, scaleLinear, select } from 'd3';
import bbox from '@turf/bbox';
import { Selection } from 'd3-selection';
import { PopulationService } from '../common/service/population.service';
import { interpolateOranges } from 'd3-scale-chromatic';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements AfterViewInit {
  tooltip: Selection<any, any, any, any> | undefined;

  population: InternMap =
    this.populationService.getAgeMedianPerMunicipalityByYear(2022);

  width = 1200;
  height = 600;

  private pathGenerator: GeoPath<any, any> | null = null;

  constructor(private populationService: PopulationService) {}

  ngAfterViewInit() {
    this.constructTooltip();
    this.constructPathGenerator();
    this.renderMap();
  }

  /**
   * Render the initial map
   */
  renderMap() {
    select('#mapCanvas')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    this.redraw();
  }

  private redraw() {
    select('#mapCanvas')
      .selectAll('path')
      .data(mapData.features)
      .enter()
      .append('path')
      .attr('d', this.pathGenerator)
      .attr('class', 'municipality')
      .attr('stroke', 'gray')
      .attr('stroke-width', 0.5)
      .attr('fill', (d) => {
        const age = this.getMedianAgePerId(d);
        return interpolateOranges((1 / 20) * (age - 35));
      })
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
    this.tooltip
      ?.html(
        '<b>' +
          data.properties.name +
          '</b><br>' +
          'Medianalter: ' +
          this.getMedianAgePerId(data)
      )
      .style('left', event.x + 15 + 'px')
      .style('top', event.y + 'px');
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
    select(event.currentTarget)
      .style('stroke', 'gray')
      .style('stroke-width', 0.5);
  }

  /**
   * Extract the median age from the population data for a corresponding shape data.
   * Therefore, maps the `gemeinde_id_bfs` from the geo-json to a municipality from the population data
   *
   * @param d The shape data from the geo-json
   * @private
   */
  private getMedianAgePerId(d: any): number {
    return this.population.get(d.properties.gemeinde_id_bfs);
  }

  /**
   * Construct the path generator with projection for the LV95 swiss coordinates according to the tutorial
   * of Benja Zehr on {@link https://blog.az.sg/posts/mapping-switzerland-2/}.
   *
   * @private
   */
  private constructPathGenerator() {
    const [maxX, maxY, minX, minY] = bbox(mapData);
    const height = ((maxY - minY) / (maxX - minX)) * this.width;

    const x = scaleLinear().range([0, this.width]).domain([maxX, minX]);
    const y = scaleLinear().range([0, height]).domain([minY, maxY]);

    const projection = geoTransform({
      point: function (px, py) {
        this.stream.point(x(px), y(py));
      },
    });

    this.pathGenerator = geoPath<any>().projection(projection);
  }

  /**
   * Construct the initial tooltip with a new div appended to the DOM.
   * Does have more styles from the css class.
   *
   * @private
   */
  private constructTooltip() {
    this.tooltip = select('#mapWrapper')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'map-tooltip')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
  }
}
