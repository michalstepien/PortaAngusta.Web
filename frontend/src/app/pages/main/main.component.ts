import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  menu: Array<{link: string, name: string}> = [];
  side1Size = 0;
  side2Size = 0;
  mainSize = 90;

  isActivatedSide1 = false;
  isActivatedSide2 = false;

  constructor() { }

  ngOnInit() {
    this.buildMenu();
  }

  public buildMenu() {
    this.menu.push({link: '/app/jobs', name: 'Jobs'});
    this.menu.push({link: '/app/scripts', name: 'Scripts'});
    this.menu.push({link: '/app/about', name: 'About me'});
  }

  setSize() {
    this.side1Size = 30;
    this.mainSize = this.mainSize - this.side1Size;
  }

  closeSide() {
    this.mainSize = this.mainSize + this.side1Size;
    this.side1Size = 0;
  }

}
