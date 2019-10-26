
import { BaseController, Controller, Plain, Get } from './base';
import request from 'request';
import cheerio from 'cheerio';

@Controller('proxy')
export class ProxyController extends BaseController {

    @Get('url/:url')
    @Plain()
    public async auth(req: any, res: any) {
        const u = req.params.url;
        if (u) {
            const x = request(u.toString());
            const html: string = await this.streamToString(x);
            req.pipe(x);
            const $ = cheerio.load(html);
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
                document.body.onmouseover = handler;
                function handler(event) {
                  if (event.target === document.body ||
                      (prev && prev === event.target)) {
                    return;
                  }
                  if (prev) {
                    if(prev.classList.contains("portangusta-high")) prev.classList.remove("portangusta-high");
                    prev = undefined;
                  }
                  if (event.target) {
                    prev = event.target;
                    if(!prev.classList.contains("portangusta-high")) prev.classList.add("portangusta-high");
                  }
                }
              })();

              $("a").each(function () {
                this.addEventListener("click", (function () {
                    e.preventDeault();
                 } ()), false);
             });

              </script>
            `);
            res.end($.html());
        } else {
            res.end('no url found');
        }
    }

    async streamToString(stream: any): Promise<string> {
        const chunks: any = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
    }
}
