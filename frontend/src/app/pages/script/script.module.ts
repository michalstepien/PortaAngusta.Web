import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScriptRoutingModule } from './script-routing.module';
import { ScriptComponent } from './script.component';


@NgModule({
  declarations: [ScriptComponent],
  imports: [
    CommonModule,
    ScriptRoutingModule
  ]
})
export class ScriptModule { }
