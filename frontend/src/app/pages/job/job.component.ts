import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Job, JobStatut, JobType } from '../../models/job';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  loader = false;
  types: Array<{ text: string, value: number }> = [
    { text: 'Script', value: 1 },
    { text: 'Search', value: 2 }
  ];

  job: Job = {
    name: '',
    description: '',
    status: 0,
    typeJob: 1
  };

  constructor(private snackBar: MatSnackBar, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(p => {
      if (p.id && p.id !== '0:0') {
        this.loader = true;
        this.http.get<Job>('/api/jobs/job/' + p.id).toPromise().then((d) => {
          this.job = d;
          this.loader = false;
        });
      } else {
        this.job = new Job();
        this.job.name = '';
        this.job.description = '';
        this.job.status = JobStatut.waiting;
        this.job.typeJob = JobType.search;
      }
    });
  }

  public save() {
    this.loader = true;

    this.http.post<Job>('/api/jobs/job', { job: this.job}).toPromise().then((d) => {
      this.openSnackBar();
      this.loader = false;
    });
  }

  openSnackBar() {
    this.snackBar.open('Saved', null, {
      duration: 2000,
      panelClass: ['mat-accent']
    });
  }

}
