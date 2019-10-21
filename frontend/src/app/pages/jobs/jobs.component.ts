import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { IResults } from '../../interfaces/results';

export interface Job {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
}


@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'description', 'typeJob', 'status'];
  dataSource = new MatTableDataSource<Job>([]);
  selection = new SelectionModel<Job>(true, []);

  length = 0;
  skip = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(public route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.loadJobs();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Job): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  async loadJobs() {
    const data =  await this.http.get<IResults>('/api/jobs/list?limit=' + this.pageSize + '&skip=' + this.skip).toPromise();
    this.length = data.count;
    this.dataSource.data = data.results;
  }

  changePage(page: PageEvent) {
    this.pageSize = page.pageSize;
    this.skip = page.pageIndex * page.pageSize;
    this.loadJobs();
  }

}
