import { JobResults } from '../models/jobResults';
import { BaseController, Controller, Description, Param, Delete, Get, Post, Put } from './base';

@Controller('searchresults')
export class SearchResultController extends BaseController {

    @Description('Get search result from DB')
    @Get('res/:id')
    public async getSearchResults(@Param id: string): Promise<any> {
        console.log(id);
        const j: JobResults = new JobResults();
        j.id = id;
        const r = await j.load();
        return r.results;
    }
}
