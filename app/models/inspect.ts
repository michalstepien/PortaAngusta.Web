import { Base, dbProperty, ModelClass } from './base';

@ModelClass('Inspect')
export class Inspect extends Base<Inspect> {

    @dbProperty()
    public name = '';

    @dbProperty()
    public siblings = false;

    @dbProperty()
    public output: InspectOutput = InspectOutput.html;

    @dbProperty()
    public element: any = null;

    constructor() {
        super(Inspect);
    }

}

export enum InspectOutput {
    html = 0,
    text = 1,
    url = 2,
    image = 3
}
