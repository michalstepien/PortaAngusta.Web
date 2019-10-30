
import { BaseController, Controller, Plain, Get } from './base';
import url from 'url';
import got from 'got';
import cheerio from 'cheerio';

@Controller('proxy')
export class ProxyController extends BaseController {

  @Get('url/:url')
  @Plain()
  public async html(req: any, res: any) {
    const u = req.params.url;
    if (u) {
      try {
        const x = await got(u.toString(), { rejectUnauthorized: false, encoding: null });
        if (x.headers['content-type'].startsWith('text/html')) {
          const html: string = x.body;
          const $ = cheerio.load(html);
          const urlTmp = x.url;
          $('script').each((i, e) => {
            const src = $(e).attr('src');
            if (src && !src.startsWith('http')) {
              $(e).attr('src', 'http://localhost:8084/api/proxy/url/' +
                encodeURIComponent(url.resolve(urlTmp, $(e).attr('src'))));
            }
          });
          $('source').each((i, e) => {
            const src = $(e).attr('srcset');
            if (src && !src.startsWith('http')) {
              $(e).attr('srcset', 'http://localhost:8084/api/proxy/file/' +
                encodeURIComponent(url.resolve(urlTmp, $(e).attr('srcset'))));
            }
          });
          $('img').each((i, e) => {
            const src = $(e).attr('src');
            if (src && !src.startsWith('http')) {
              $(e).attr('src', 'http://localhost:8084/api/proxy/file/' +
                encodeURIComponent(url.resolve(urlTmp, $(e).attr('src'))));
            }
          });
          $('link').each((i, e) => {
            const src = $(e).attr('href');
            if (src && !src.startsWith('http')) {
              $(e).attr('href', 'http://localhost:8084/api/proxy/url/' + encodeURIComponent(url.resolve(urlTmp, $(e).attr('href'))));
            }
          });
          $('body').append(`
              <style>
                .portangusta-high {
                  background-color: yellow;
                  box-sizing: border-box;
                  -moz-box-sizing: border-box;
                  -webkit-box-sizing: border-box;
                  border: 3px solid #f00;
                }
              </style>
              `);
          $('body').append(`
              <script>
              (function() {
                  var prev;
                  window.paInspect = false;
                  var avoidChange = false;
                  window.paCollection = [];
                  var iter = 0;
                  document.body.onclick = clickhandler;
                  document.body.onmouseover = handler;
                  function handler(event) {
                    if(avoidChange || !window.paInspect) return;
                    if (event.target === document.body ||
                        (prev && prev === event.target)) {
                      return;
                    }
                    if (prev) {
                      if(prev.classList.contains("portangusta-high") && !prev.classList.contains("portangusta-high-click")) prev.classList.remove("portangusta-high");
                      prev = undefined;
                    }
                    if (event.target) {
                      prev = event.target;
                      if(!prev.classList.contains("portangusta-high")) prev.classList.add("portangusta-high");
                    }
                  }
                  function clickhandler(event) {
                      if(event.ctrlKey && window.paInspect) {
                        prev.classList.toggle("portangusta-high-click");
                        if(prev.classList.contains("portangusta-high-click")) {
                          window.parent.postMessage({ fn: "add", el: window.paCollection.length });
                          window.paCollection.push(prev);
                        } else{
                          const indx = window.paCollection.findIndex(h => h.isEqualNode(prev));
                          if(indx > -1) {
                            window.parent.postMessage({ fn: "del", el: indx });
                            window.paCollection.splice(indx, 1);
                          }
                        }
                      }
                      return false;
                  }
                })();
                </script>
              `);
          req.pipe(x);
          const headers = x.headers;
          headers['access-control-allow-origin'] = '*';
          delete headers['content-security-policy'];
          delete headers['set-cookie'];
          delete headers['content-encoding'];
          delete headers['x-frame-options'];
          res.set(headers);
          res.send($.html());
        } else {
          const headers = x.headers;
          delete headers['content-encoding'];
          delete headers['x-frame-options'];
          res.set(headers);
          req.pipe(x);
          res.send(x.body);
        }
      } catch (error) {
        console.log(error);
        res.status(404).end();
      }
    } else {
      res.status(404).end();
    }
  }

  @Get('file/:url')
  @Plain()
  public async file(req: any, res: any) {
    const u = req.params.url;
    if (u) {
      try {
        const x = await got(u.toString(), { rejectUnauthorized: false, encoding: null });
        const headers = x.headers;
        delete headers['content-encoding'];
        delete headers['x-frame-options'];
        res.set(headers);
        req.pipe(x);
        res.send(x.body);
      } catch (error) {
        res.status(404).end();
      }

    } else {
      res.status(404).end();
    }
  }

}
