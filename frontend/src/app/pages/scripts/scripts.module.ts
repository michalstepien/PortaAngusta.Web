import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScriptsRoutingModule } from './scripts-routing.module';
import { ScriptsComponent } from './scripts.component';


@NgModule({
  declarations: [ScriptsComponent],
  imports: [
    CommonModule,
    ScriptsRoutingModule
  ]
})
export class ScriptsModule { }
