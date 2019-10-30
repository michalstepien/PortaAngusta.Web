import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getSiblingsElements, getElement, ElementIdentifier, findElements, identifierFromElement} from 'contextual-element-identifier';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-proxy',
  templateUrl: './proxy.component.html',
  styleUrls: ['./proxy.component.scss']
})
export class ProxyComponent implements OnInit {

  ei: ElementIdentifier;
  url = 'https://pl.wikipedia.org/wiki/Z%C5%82awie%C5%9B_Wielka';
  name = '';
  urlSafe: SafeResourceUrl;
  inspectedElements: Array<any> = [];

  outputType: Array<{ text: string, value: number }> = [
    { text: 'Html', value: 1 },
    { text: 'Text', value: 2 },
    { text: 'Url', value: 3 },
    { text: 'Image', value: 4 }
  ];


  constructor(public sanitizer: DomSanitizer, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.urlSafe =  this.sanitizer.bypassSecurityTrustResourceUrl('/api/proxy/url/' + encodeURIComponent(this.url));
  }

  goto() {
    console.log('/api/proxy/url/' + encodeURIComponent(this.url));
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('/api/proxy/url/' + encodeURIComponent(this.url));
  }

  reloadIFrame() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    f.contentWindow.location.reload(true);
  }

  getSelectedHtml() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document.getElementsByClassName('portangusta-high');
    this.ei = identifierFromElement(d[0], [], f.contentWindow.document);
  }

  identify() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document;
    const elements = findElements(this.ei, d);
    elements.forEach(a => {
      a.classList.add('portangusta-high');
    });
  }

  inspect() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const w: any = f.contentWindow;
    w.paInspect = !w.paInspect;
  }

  siblings() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document;
    const s = getSiblingsElements(this.ei, d);
    s.forEach(a => {
      a.classList.add('portangusta-high');
    });
    console.log(s);
  }

  clearSelection() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document.getElementsByClassName('portangusta-high');
    Array.from(d).forEach((el) => {
      el.classList.remove('portangusta-high');
    });
  }

  onLoadedProxy() {

  }

  @HostListener('window:message', ['$event'])
  addInspectedElement($event: any) {
    if ($event.data.fn === 'add') {
      const f = document.getElementById('proxyFrame') as HTMLIFrameElement as any;
      const w = f.contentWindow.paCollection;
      this.inspectedElements.push({output: 1, ident: identifierFromElement(w[$event.data.el],
        ['portangusta-high', 'portangusta-high-click'],
        f.contentWindow.document), elem: w[$event.data.el]});
    }
    // this.ref.markForCheck();
    // this.ref.detectChanges();
  }

  previewOutput(el: any) {
    console.log(el);
  }

}
