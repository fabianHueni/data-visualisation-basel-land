import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopulationService } from '../common/service/population.service';

@Component({
  selector: 'app-municipality',
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss'],
})
export class MunicipalityComponent implements OnInit {
  public municipalityId = 2869;
  public municipalities = this.popService.getMunicipalities();

  constructor(
    private route: ActivatedRoute,
    private popService: PopulationService
  ) {}

  ngOnInit() {
    /*     this.route.queryParams.subscribe(
      (params) => (this.municipalityId = params['id'])
    ); */
    this.selectedMunicipality = this.popService.getMunicipalityName(
      this.municipalityId
    );
  }

  public set selectedMunicipality(municipality: string) {
    this._selectedMunicipality = municipality;
    console.log(this._selectedMunicipality);
    this.updateData();
  }
  public get selectedMunicipality() {
    return this._selectedMunicipality;
  }

  public _selectedMunicipality: string = 'Liestal';

  private updateData() {
    this.municipalityId = this.popService.getMunicipalityIdByName(
      this._selectedMunicipality
    );
    console.log(this.municipalityId);
  }
}
