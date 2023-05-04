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
    this.route.params.subscribe((params) => {
      // TODO: handle incoming id correct
      // this.municipalityId = params['id'];
      console.log(params['id']);
    });

    this.selectedMunicipality = this.popService.getMunicipalityName(
      this.municipalityId
    );
  }

  public set selectedMunicipality(municipality: string) {
    console.log(municipality);
    this._selectedMunicipality = municipality;
    this.updateData();
  }
  public get selectedMunicipality() {
    return this._selectedMunicipality;
  }

  public _selectedMunicipality = 'Liestal';

  private updateData() {
    this.municipalityId = this.popService.getMunicipalityIdByName(
      this._selectedMunicipality
    );
  }
}
