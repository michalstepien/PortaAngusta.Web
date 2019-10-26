import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';

export interface ISearchResult {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
}


@Component({
  selector: 'app-searchresults',
  templateUrl: './searchResults.component.html',
  styleUrls: ['./searchResults.component.scss']
})
export class SearchResultsComponent implements OnInit {

  displayedColumns: string[] = ['keyword', 'title', 'link', 'snippet'];
  dataSource = new MatTableDataSource<ISearchResult>([]);

  constructor(public route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.route.params.subscribe(async p => {
      this.loadSearchResults(p.id);
    });

  }

  async loadSearchResults(id: string) {
    const url = '/api/searchresults/res/' + id;
    console.log(url);
    const data =  await this.http.get<any>(url).toPromise();
    this.dataSource.data = data;
  }

}
