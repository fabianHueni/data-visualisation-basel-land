import { Component, Input } from '@angular/core';
import {
  faBriefcase,
  faChildren,
  faMars,
  faPeopleGroup,
  faPersonCane,
  faVenus,
} from '@fortawesome/free-solid-svg-icons';
import { PopulationService } from '../common/service/population.service';

@Component({
  selector: 'app-key-numbers',
  templateUrl: './key-numbers.component.html',
  styleUrls: ['./key-numbers.component.scss'],
})
export class KeyNumbersComponent {
  // font awesome icons
  public faPeopleGroup = faPeopleGroup;
  public faMars = faMars;
  public faVenus = faVenus;
  public faChildren = faChildren;
  public faPersonCane = faPersonCane;
  public faBriefcase = faBriefcase;

  // KPI's
  public allPopulation = 0;
  public malePopulation = 0;
  public femalePopulation = 0;
  public youthQuotient = 0;
  public seniorQuotient = 0;
  public fullQuotient = 0;

  @Input()
  public set municipalityId(id: number) {
    this._municipalityId = id;
    this.updateData();
  }
  public get municipalityId(): number {
    return this._municipalityId;
  }

  private _municipalityId = 0;

  constructor(private populationService: PopulationService) {}

  private updateData() {
    this.allPopulation = this.populationService.getNumberOfInhabitants(
      this.municipalityId,
      0,
      2022
    );
    this.malePopulation = this.populationService.getNumberOfInhabitants(
      this.municipalityId,
      1,
      2022
    );
    this.femalePopulation = this.populationService.getNumberOfInhabitants(
      this.municipalityId,
      2,
      2022
    );
    this.youthQuotient = this.populationService.getYouthQuotient(
      this.municipalityId,
      2022
    );
    this.seniorQuotient = this.populationService.getSeniorQuotient(
      this.municipalityId,
      2022
    );
    this.fullQuotient = this.populationService.getFullQuotient(
      this.municipalityId,
      2022
    );
  }
}
