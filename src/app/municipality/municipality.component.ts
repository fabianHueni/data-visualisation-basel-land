import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopulationService } from '../common/service/population.service';
import { Municipality } from '../common/model/population.interface';
import { Location } from '@angular/common';

@Component({
  selector: 'app-municipality',
  templateUrl: './municipality.component.html',
  styleUrls: ['./municipality.component.scss'],
})
export class MunicipalityComponent implements OnInit {
  public municipalities: Municipality[] =
    this.popService.getAllMunicipalities();

  private _selectedMunicipality: Municipality = this.municipalities[0];

  constructor(
    private route: ActivatedRoute,
    private popService: PopulationService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.selectedMunicipality =
        this.municipalities.find(
          (municipality) => municipality.id == params['id']
        ) ?? this.selectedMunicipality;
    });

    this.sortMunicipalities();
  }

  /**
   * Set the new municipality and update the url to represent the selected municipality id
   * @param municipality
   */
  public set selectedMunicipality(municipality: Municipality) {
    this._selectedMunicipality = municipality;
    this.location.replaceState('/gemeinde/' + this._selectedMunicipality.id);
  }

  public get selectedMunicipality(): Municipality {
    return this._selectedMunicipality;
  }

  /**
   * Sort the municipalities descending by the name
   * @private
   */
  private sortMunicipalities() {
    this.municipalities = this.municipalities.sort((a, b) =>
      a.name < b.name ? -1 : 1
    );
  }
}
