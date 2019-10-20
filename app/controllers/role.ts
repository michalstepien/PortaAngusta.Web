import { Role } from '../models/role';
import { BaseControllerOf, Controller, Delete, Get, Post, Put } from './base';

@Controller('role')
export class RoleController extends BaseControllerOf<Role> {
    public model: any = new Role();
    constructor() {
        super();
    }
}
