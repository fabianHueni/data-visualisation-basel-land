import { Component, OnInit } from '@angular/core';
import { PopulationService } from './common/service/population.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'data-visualisation-basel-land';

  constructor(private dataService: PopulationService) {}

  async ngOnInit() {
    // this.dataService.getPopulationData();
    /*    console.log(data.slice(0, 100));

    // @ts-ignore
    const sumPersons = sum(data, (d) => +d.anzahl_personen);
    console.log(sumPersons);

    console.log(
      group(data, (d) => d.year),
      (d: any) => d.gemeinde
    );*/

    const personsByCity =
      this.dataService.getAgeMedianPerMunicipalityByYear(2022);

    console.log(personsByCity);
    console.log(personsByCity.get(2022)?.get('Wintersingen'));
  }
}
