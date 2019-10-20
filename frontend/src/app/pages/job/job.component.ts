import { Component, OnInit } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Script } from 'vm';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  loader = false;
  types: Array<{text: string, value: number }> = [
    { text: 'Script', value: 1},
    { text: 'Search', value: 2}
  ];

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  public save() {
    this.loader = true;
    this.openSnackBar();
    setTimeout(() => {
      this.loader = false;
    } , 1000);
  }

  openSnackBar() {
    this.snackBar.open('Saved', null, {
      duration: 2000,
      panelClass: ['mat-accent']
    });
  }

}
