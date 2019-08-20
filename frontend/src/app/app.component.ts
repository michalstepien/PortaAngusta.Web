import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  testPullZRequest = 'testing';

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    const dt = await this.http.get('api/roles/all').toPromise();
    console.log(dt);
  }

  public whitoutTest() {
    this.testPullZRequest = 'test';
  }
}
