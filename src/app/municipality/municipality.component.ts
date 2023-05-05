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
  public municipalitiesNames: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private popService: PopulationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.municipalityId = params['id'];
      this.selectedMunicipality = this.popService.getMunicipalityName(
        this.municipalityId
      );
    });
    this.sortMunicipalities();

    this.selectedMunicipality = this.popService.getMunicipalityName(
      this.municipalityId
    );
  }

  private sortMunicipalities() {
    this.municipalitiesNames = this.municipalities.map((m) => m.name).sort();
    this.municipalities = this.municipalities.sort();
  }

  public set selectedMunicipality(municipality: string) {
    this._selectedMunicipality = municipality;
    this.updateData();
  }
  public get selectedMunicipality() {
    return this._selectedMunicipality;
  }

  public _selectedMunicipality = 'Liestal';

  private updateData() {
    for (const m of this.municipalities) {
      if (m.name === this.selectedMunicipality) {
        this.municipalityId = m.id;
      }
    }
  }
}
