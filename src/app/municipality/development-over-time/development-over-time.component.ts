import { Component, Input } from '@angular/core';
import { PopulationService } from '../../common/service/population.service';

@Component({
  selector: 'app-development-over-time',
  templateUrl: './development-over-time.component.html',
  styleUrls: ['./development-over-time.component.scss'],
})
export class DevelopmentOverTimeComponent {
  @Input()
  set selectedMunicipalityId(municipalityId: number) {
    this.populationData =
      this.populationService.getMedianAgePerYearByMunicipality(municipalityId);
    console.log(this.populationData);
  }

  public populationData: any;

  constructor(private populationService: PopulationService) {}
}
