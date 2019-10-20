import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScriptsComponent } from './scripts.component';

const routes: Routes = [
  { path: '', component: ScriptsComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScriptsRoutingModule { }
