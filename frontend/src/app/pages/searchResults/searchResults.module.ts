import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchResultsRoutingModule } from './searchResults-routing.module';
import { SearchResultsComponent } from './searchResults.component';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  declarations: [SearchResultsComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    SearchResultsRoutingModule,
    MatButtonModule,
    MatPaginatorModule
  ]
})
export class SearchResultsModule { }
