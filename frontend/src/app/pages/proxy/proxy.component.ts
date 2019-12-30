import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getSiblingsElements, getElement, ElementIdentifier, findElements, identifierFromElement } from 'contextual-element-identifier';
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
  editorOptions = {theme: 'vs-dark', language: 'html', wordWrap: 'on'};
  outputValue = '';
  showPreview = false;

  outputType: Array<{ text: string, value: number }> = [
    { text: 'Html', value: 1 },
    { text: 'Text', value: 2 },
    { text: 'Url', value: 3 },
    { text: 'Image', value: 4 }
  ];


  constructor(public sanitizer: DomSanitizer, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('/api/proxy/url/' + encodeURIComponent(this.url));
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

  identify(p: any) {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document;
    const elements = findElements(p.ident, d);
    elements.forEach(a => {
      a.classList.add('portangusta-high');
    });
  }

  inspect() {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const w: any = f.contentWindow;
    w.paInspect = !w.paInspect;
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
      const el = w[$event.data.el] as HTMLElement;
      el.classList.remove('portangusta-high');
      el.classList.remove('portangusta-high-click');

      this.inspectedElements.push({
        output: 1, ident: identifierFromElement(el,
          [],
          f.contentWindow.document), elem: el,
          index: $event.data.el, siblings: false, siblingsIdent: null
      });
      el.classList.add('portangusta-high');
      el.classList.add('portangusta-high-click');
    }
  }

  previewOutput(el: any) {
    if (el.output === 1 ) {
      this.outputValue = el.elem.innerHTML;
    } else if (el.output === 2) {
      this.outputValue = el.elem.textContent;
    } else if (el.output === 3) {
      const array = [];
      const links = el.elem.getElementsByTagName('a');
      for (let i = 0, max = links.length; i < max; i++) {
          array.push(links[i].href);
      }
      this.outputValue = array.join('\n');
    }
    this.showPreview = true;
  }

  remove(i: any, el: any) {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement as any;
    f.contentWindow.paCollection.forEach(x => {
      if (x.isEqualNode(el.elem) ) {
        x.classList.remove('portangusta-high-click');
        x.classList.remove('portangusta-high');
      }
    });
    f.contentWindow.paCollection.splice(el.index, 1);
    this.inspectedElements.splice(i, 1);
  }

  siblings(el: any) {
    const f = document.getElementById('proxyFrame') as HTMLIFrameElement;
    const d = f.contentWindow.document;
    el.siblingsIdent = getSiblingsElements(el.ident, d);
    if (el.siblingsIdent) {
      el.siblingsIdent.forEach(a => {
        a.classList.add('portangusta-high');
        a.classList.add('portangusta-click');
      });
    }
  }

}
