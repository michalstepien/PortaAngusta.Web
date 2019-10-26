import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, redirectTo: 'app'
  },
  {
    path: 'app', component: MainComponent, children: [
      { path: 'jobs', loadChildren: () => import('../jobs/jobs.module').then(m => m.JobsModule) },
      { path: 'searchresults/:id', loadChildren: () => import('../searchResults/searchResults.module').then(m => m.SearchResultsModule) },
      { path: 'job/:id', outlet: 'side1', loadChildren: () => import('../job/job.module').then(m => m.JobModule) },
      { path: 'scripts', loadChildren: () => import('../scripts/scripts.module').then(m => m.ScriptsModule) },
      { path: 'script', outlet: 'side2', loadChildren: () => import('../script/script.module').then(m => m.ScriptModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
