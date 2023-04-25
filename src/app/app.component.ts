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
    const personsByCity =
      this.dataService.getAgeMedianPerMunicipalityByYear(2022);

    console.log(personsByCity);
    console.log(personsByCity.get('Wintersingen'));
  }
}
