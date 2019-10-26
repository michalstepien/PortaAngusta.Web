import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Job, JobStatut, JobType, RunType } from '../../models/job';
import { SearchSettings } from '../../models/searchSettings';
import { ActivatedRoute } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  loader = false;
  types: Array<{ text: string, value: number }> = [
    { text: 'Script', value: 2 },
    { text: 'Search', value: 1 }
  ];

  searchTypes: Array<{ text: string, value: string }> = [
    { text: 'Google', value: 'google' },
    { text: 'Google news', value: 'google_news' },
    { text: 'Google images', value: 'google_image' },
    { text: 'Bing', value: 'bing' },
    { text: 'Bing News', value: 'bing_news' },
    { text: 'Duck duck', value: 'duckduckgo' },
    { text: 'Infospace', value: 'infospace' },
    { text: 'Webcrawler', value: 'webcrawler' }
  ];

  searchOutputType: Array<{ text: string, value: number }> = [
    { text: 'Link', value: 1 },
    { text: 'Snippet', value: 2 },
    { text: 'Rank', value: 3 },
    { text: 'Title', value: 4 }
  ];

  job: Job = {
    id: null,
    name: '',
    description: '',
    status: JobStatut.waiting,
    typeJob: JobType.script,
    runType: RunType.manual,
    delay: 0,
    crone: '',
    searchSettings: {
      searchEngines: [],
      keywords: [],
      outputs: [],
      numberPages: 1
    }
  };

  jobResultHist = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id', 'start', 'end', 'count'];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private snackBar: MatSnackBar, private http: HttpClient, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.route.params.subscribe(async p => {
      if (p.id && p.id !== '0:0') {
        this.loader = true;
        this.job = await this.http.get<Job>('/api/jobs/job/' + p.id).toPromise();
        this.loader = false;
        if (!this.job.searchSettings) {
          this.job.searchSettings = {
            searchEngines: [],
            keywords: [],
            outputs: [],
            numberPages: 1
          };
        }
        await this.loadJobRunHistory();
      } else {
        this.job = new Job();
        this.job.id = null;
        this.job.name = '';
        this.job.description = '';
        this.job.status = JobStatut.waiting;
        this.job.typeJob = JobType.search;
        this.job.delay = 0;
        this.job.crone = '';
        this.job.runType = RunType.manual;
        this.job.searchSettings = new SearchSettings();
      }
    });
  }

  public async save() {
    this.loader = true;
    await this.http.post<Job>('/api/jobs/job', { job: this.job }).toPromise();
    this.openSnackBar();
    this.loader = false;
  }

  openSnackBar() {
    this.snackBar.open('Saved', null, {
      duration: 2000,
      panelClass: ['mat-accent']
    });
  }

  add(event: MatChipInputEvent): void {
    if (!this.job.searchSettings.keywords) {
      this.job.searchSettings.keywords = [];
    }
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.job.searchSettings.keywords.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
  }

  remove(k: string): void {
    const index = this.job.searchSettings.keywords.indexOf(k);

    if (index >= 0) {
      this.job.searchSettings.keywords.splice(index, 1);
    }
  }

  async run() {
    await this.http.get('/api/jobs/job/run/' + this.job.id).toPromise();
    this.snackBar.open('Job running', null, {
      duration: 2000,
      panelClass: ['mat-accent']
    });
  }

  async loadJobRunHistory() {
    const res: any = await this.http.get('/api/jobs/results/list/' + this.job.id).toPromise();
    console.log(res.results);
    this.jobResultHist.data = res.results;
  }

}
