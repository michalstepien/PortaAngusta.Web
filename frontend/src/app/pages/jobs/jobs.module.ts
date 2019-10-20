import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [JobsComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    JobsRoutingModule
  ]
})
export class JobsModule { }
