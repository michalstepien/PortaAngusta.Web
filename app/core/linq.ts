import * as ts from 'typescript';
import { RSA_NO_PADDING } from 'constants';

enum sqlActionType {
    select = 0,
    delete = 1,
    update = 2
}

export default class Collection<T> {
    private className: string;
    private executionFunction: (cmd: string, projection: boolean, oneRecord: boolean, params: any) => Promise<T[]>;
    private deleteFunction: (cmd: string, params: any) => Promise<number>;
    private updateFunction: (cmd: string, params: any) => Promise<number>;
    private isCount: boolean;
    private skipNumber: number;
    private limitNumber: number;
    private selectQuery: (t: T) => any;
    private whereQuery: (t: T) => boolean;
    private params: any;
    private luceneSearchIndexQuery: (t: T, isTrue?: boolean) => any;
    private orderByQuery: (t: T, desc?: boolean) => any;
    private orderByDesc: boolean;
    private groupByQuery: (t: T) => any;
    private countFunct: (t: T) => any;
    private varianceFunct: (t: T) => any;
    private modeFunct: (t: T) => any;
    private medianFunct: (t: T) => any;
    private percentileFunct: (t: T) => any;
    private absFunct: (t: T) => any;
    private avgFunct: (t: T) => any;
    private distinctFunct: (t: T) => any;
    private sumFunct: (t: T) => any;
    private minFunct: (t: T) => any;
    private maxFunct: (t: T) => any;
    private firstFunct: (t: T) => any;
    private lastFunct: (t: T) => any;
    private expandFunct: (t: T) => any;
    private outFunct: (t: T) => any;
    private inFunct: (t: T) => any;

    private oneRecord: boolean;

    constructor(classn: string,
                executefn: (cmd: string, projection: boolean, oneRecord: boolean, params: any) => Promise<T[]>,
                deletefn: (cmd: string, params: any) => Promise<number>,
                updatefn: (cmd: string, params: any) => Promise<number>,
    ) {
        this.className = classn;
        this.executionFunction = executefn;
        this.deleteFunction = deletefn;
        this.updateFunction = updatefn;
    }

    public where(query: (t: T) => boolean, params?: any): Collection<T> {
        this.whereQuery = query;
        this.params = params;
        return this;
    }

    public luceneSearchIndex(query: (t: T) => any, isTrue: boolean = true): Collection<T> {
        this.luceneSearchIndexQuery = query;
        return this;
    }

    public orderBy(query: (t: T) => any, desc: boolean = false): Collection<T> {
        this.orderByQuery = query;
        this.orderByDesc = desc;
        return this;
    }

    public groupBy(query: (t: T) => any): Collection<T> {
        this.groupByQuery = query;
        return this;
    }

    public select(query: (t: T) => any): Collection<T> {
        this.selectQuery = query;
        return this;
    }

    public sum(query: (t: T) => any): Collection<T> {
        this.sumFunct = query;
        return this;
    }

    public min(query: (t: T) => any): Collection<T> {
        this.minFunct = query;
        return this;
    }

    public max(query: (t: T) => any): Collection<T> {
        this.maxFunct = query;
        return this;
    }

    public distinct(query: (t: T) => any): Collection<T> {
        this.distinctFunct = query;
        return this;
    }

    public count(query?: (t: T) => any): Collection<T> {
        if (query) {
            this.countFunct = query;
        } else {
            this.isCount = true;
        }
        return this;
    }

    public skip(skip: number): Collection<T> {
        this.skipNumber = skip;
        return this;
    }

    public limit(limit: number): Collection<T> {
        this.limitNumber = limit;
        return this;
    }

    public execute(): Promise<T[]> {
        return this.executionFunction(this.getSql(), false, false, this.params);
    }

    public executeProjection(): any {
        return this.executionFunction(this.getSql(), true, this.isCount, this.params);
    }

    public delete(): Promise<number> {
        return this.deleteFunction(this.getSql(sqlActionType.delete), this.params);
    }

    public update(m: T): Promise<number> {
        return this.updateFunction(this.getSql(sqlActionType.update), this.params);
    }

    private getSql(action: sqlActionType = sqlActionType.select, m: T = null): string {
        let selectString = this.queryToSql(this.selectQuery);
        const whereString = this.queryToSql(this.whereQuery);
        const luceneSearchIndexString = this.queryToSqlLucene(this.luceneSearchIndexQuery);
        const orderByString = this.queryToSql(this.orderByQuery);
        const groupByString = this.queryToSql(this.groupByQuery);
        const countString = this.queryToSql(this.countFunct);

        if (selectString.length === 0) {
            selectString = '*';
        }

        if (this.isCount) {
            selectString = ' COUNT(*) as onerec';
        }

        if (countString.length > 0) {
            if (selectString === '') {
                throw (new Error('Cannot count without '));
            }
            selectString = selectString + ', COUNT(' + countString + ') AS count';
        }

        let ret = '';
        if (action === sqlActionType.select) {
            ret = 'SELECT ' + selectString + ' FROM ' + this.className + ' ';
        } else if (action === sqlActionType.delete) {
            ret = 'DELETE FROM ' + this.className + ' ';
        } else if (action === sqlActionType.update) {
            ret = 'UPDATE ' + this.className + ' SET CONTENT ';
        }

        if (whereString.length > 0) {
            ret += ' WHERE ' + whereString;
        }
        if (orderByString.length > 0) {
            ret += ' ORDER BY ' + orderByString + (this.orderByDesc ? ' DESC' : 'ASC');
        }
        if (groupByString.length > 0) {
            ret += ' GROUP BY ' + groupByString;
        }
        if (this.skipNumber) {
            ret += ' SKIP ' + this.skipNumber;
        }
        if (this.limitNumber) {
            ret += ' LIMIT ' + this.limitNumber;
        }

        return ret;
    }

    private queryToSql(query: (t: T) => boolean): string {
        if (query) {
            const src = ts.createSourceFile('test.ts', query.toString(), ts.ScriptTarget.ES2018, false);
            const expr = src.statements[0] as ts.ExpressionStatement;
            const arrFunc = expr.expression as ts.ArrowFunction;
            return this.toSql(arrFunc.body);
        }
        return '';
    }

    private queryToSqlLucene(query: (t: T) => boolean): string {
        if (query) {
            const src = ts.createSourceFile('test.ts', query.toString(), ts.ScriptTarget.ES2018, false);
            const expr = src.statements[0] as ts.ExpressionStatement;
            const arrFunc = expr.expression as ts.ArrowFunction;
            return this.toSqlLucene(arrFunc.body);
        }
        return '';
    }

    private toSql(expr: ts.Node): string {
        switch (expr.kind) {
            case ts.SyntaxKind.ArrayLiteralExpression:
                break;
            case ts.SyntaxKind.PropertyAccessExpression:
                const paExpr = expr as ts.PropertyAccessExpression;
                const parent = paExpr.expression;
                let t = '';
                if (parent && parent.kind !== ts.SyntaxKind.Identifier) {
                    t = this.toSql(parent) + '.';
                }
                return t + (paExpr.name.text === 'id' ? '@rid' : paExpr.name.text);
            case ts.SyntaxKind.ParenthesizedExpression:
                const parExpr = expr as ts.ParenthesizedExpression;

                if (parExpr.expression.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                    return '(' + this.toSql(parExpr.expression) + ')';
                } else {
                    return this.toSql(parExpr.expression);
                }
            case ts.SyntaxKind.BinaryExpression:
                const bExpr = expr as ts.BinaryExpression;

                let op = '';
                switch (bExpr.operatorToken.kind) {
                    case ts.SyntaxKind.EqualsEqualsToken:
                        op = '=';
                        break;
                    case ts.SyntaxKind.EqualsEqualsEqualsToken:
                        op = '=';
                        break;
                    case ts.SyntaxKind.GreaterThanToken:
                        op = '>';
                        break;
                    case ts.SyntaxKind.GreaterThanEqualsToken:
                        op = '>=';
                        break;
                    case ts.SyntaxKind.LessThanToken:
                        op = '<';
                        break;
                    case ts.SyntaxKind.LessThanEqualsToken:
                        op = '<=';
                        break;
                    case ts.SyntaxKind.AmpersandAmpersandToken:
                        op = 'and';
                        break;
                    case ts.SyntaxKind.BarBarToken:
                        op = 'or';
                        break;
                    default:
                        op = '[UndefinedOperator]';
                }

                return this.toSql(bExpr.left) + ' ' + op + ' ' + this.toSql(bExpr.right);
            case ts.SyntaxKind.NumericLiteral:
                const nlExpr = expr as ts.NumericLiteral;
                return nlExpr.text;
            case ts.SyntaxKind.StringLiteral:
                const slExpr = expr as ts.StringLiteral;
                return '\'' + slExpr.text + '\'';
            case ts.SyntaxKind.CallExpression:
                const cExpr = expr as ts.CallExpression;
                if (cExpr.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    const cpaExpr = cExpr.expression as ts.PropertyAccessExpression;
                    let funcName = '';
                    let args = '';

                    switch (cpaExpr.name.text) {
                        case 'toUpperCase':
                            funcName = 'toUpperCase()';
                            break;
                        case 'toLowerCase':
                            funcName = 'toLowerCase()';
                            break;
                        case 'size':
                            funcName = 'size()';
                            break;
                        case 'lengthString':
                            funcName = 'length()';
                            break;
                        case 'trim':
                            funcName = 'trim()';
                            break;
                        case 'type':
                            funcName = 'type()';
                            break;
                        case 'replace':
                            funcName = 'replace(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'append':
                            funcName = 'append(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'substring':
                            funcName = 'SUBSTRING';
                            args = ', ' + cExpr.arguments.map(e => this.toSql(e)).join(', ');
                            break;
                        case 'asBoolean':
                            funcName = 'asBoolean()';
                            break;
                        case 'asDate':
                            funcName = 'asDate()';
                            break;
                        case 'asDateTime':
                            funcName = 'asDateTime()';
                            break;
                        case 'asDecimal':
                            funcName = 'asDecimal()';
                            break;
                        case 'asFloat':
                            funcName = 'asFloat()';
                            break;
                        case 'asInteger':
                            funcName = 'asInteger()';
                            break;
                        case 'asList':
                            funcName = 'asList()';
                            break;
                        case 'asLong':
                            funcName = 'asLong()';
                            break;
                        case 'asString':
                            funcName = 'asString()';
                            break;
                        case 'charAt':
                            funcName = 'charAt(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'convert':
                            funcName = 'convert(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'hash':
                            funcName = 'hash()';
                            break;
                        case 'indexOf':
                            funcName = 'indexOf(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        default:
                            funcName = '[UndefinedFunction]';
                            break;
                    }
                    return this.toSql(cpaExpr.expression) + '.' + funcName;
                }
                break;
            case ts.SyntaxKind.ObjectLiteralExpression:
                const olExpr = expr as ts.ObjectLiteralExpression;

                return olExpr.properties.map(pr => {
                    switch (pr.kind) {
                        case ts.SyntaxKind.PropertyAssignment:
                            const prAs = pr as ts.PropertyAssignment;
                            const prNameObject = prAs.name as ts.Identifier;

                            return this.toSql(prAs.initializer) + ' as ' + prNameObject.text;
                        default:
                            return '[undefined]';
                    }
                }).join(',\n');
            case ts.SyntaxKind.ElementAccessExpression:
                const paExpr2 = expr as ts.ElementAccessExpression;
                const parent2 = paExpr2.expression;
                let t2 = '';
                if (parent2 && parent2.kind !== ts.SyntaxKind.Identifier) {
                    t2 = this.toSql(parent2);
                }
                const n = paExpr2.argumentExpression as ts.NumericLiteral;
                return t2 + '[' + n.text + ']';
            case ts.SyntaxKind.Identifier:
                const paExpr4 = expr as ts.Identifier;
                return ':' + paExpr4.escapedText;
            case ts.SyntaxKind.TemplateExpression:
                return '""';
            default:
                console.log(expr.kind);
                return '[undefined]';
        }
    }

    private toSqlLucene(expr: ts.Node): string {
        switch (expr.kind) {
            case ts.SyntaxKind.ArrayLiteralExpression:
                break;
            case ts.SyntaxKind.PropertyAccessExpression:
                const paExpr = expr as ts.PropertyAccessExpression;
                const parent = paExpr.expression;
                let t = '';
                if (parent && parent.kind !== ts.SyntaxKind.Identifier) {
                    t = this.toSql(parent) + '.';
                }
                return t + paExpr.name.text;
            case ts.SyntaxKind.ParenthesizedExpression:
                const parExpr = expr as ts.ParenthesizedExpression;

                if (parExpr.expression.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                    return '(' + this.toSql(parExpr.expression) + ')';
                } else {
                    return this.toSql(parExpr.expression);
                }
            case ts.SyntaxKind.BinaryExpression:
                const bExpr = expr as ts.BinaryExpression;

                let op = '';
                switch (bExpr.operatorToken.kind) {
                    case ts.SyntaxKind.EqualsEqualsToken:
                        op = '=';
                        break;
                    case ts.SyntaxKind.EqualsEqualsEqualsToken:
                        op = '=';
                        break;
                    case ts.SyntaxKind.GreaterThanToken:
                        op = '>';
                        break;
                    case ts.SyntaxKind.GreaterThanEqualsToken:
                        op = '>=';
                        break;
                    case ts.SyntaxKind.LessThanToken:
                        op = '<';
                        break;
                    case ts.SyntaxKind.LessThanEqualsToken:
                        op = '<=';
                        break;
                    case ts.SyntaxKind.AmpersandAmpersandToken:
                        op = 'and';
                        break;
                    case ts.SyntaxKind.BarBarToken:
                        op = 'or';
                        break;
                    default:
                        op = '[UndefinedOperator]';
                }

                return this.toSql(bExpr.left) + ' ' + op + ' ' + this.toSql(bExpr.right);
            case ts.SyntaxKind.NumericLiteral:
                const nlExpr = expr as ts.NumericLiteral;
                return nlExpr.text;
            case ts.SyntaxKind.StringLiteral:
                const slExpr = expr as ts.StringLiteral;
                return '\'' + slExpr.text + '\'';
            case ts.SyntaxKind.CallExpression:
                const cExpr = expr as ts.CallExpression;
                if (cExpr.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    const cpaExpr = cExpr.expression as ts.PropertyAccessExpression;
                    let funcName = '';
                    let args = '';

                    switch (cpaExpr.name.text) {
                        case 'toUpperCase':
                            funcName = 'toUpperCase()';
                            break;
                        case 'toLowerCase':
                            funcName = 'toLowerCase()';
                            break;
                        case 'size':
                            funcName = 'size()';
                            break;
                        case 'lengthString':
                            funcName = 'length()';
                            break;
                        case 'trim':
                            funcName = 'trim()';
                            break;
                        case 'type':
                            funcName = 'type()';
                            break;
                        case 'replace':
                            funcName = 'replace(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'append':
                            funcName = 'append(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'substring':
                            funcName = 'SUBSTRING';
                            args = ', ' + cExpr.arguments.map(e => this.toSql(e)).join(', ');
                            break;
                        case 'asBoolean':
                            funcName = 'asBoolean()';
                            break;
                        case 'asDate':
                            funcName = 'asDate()';
                            break;
                        case 'asDateTime':
                            funcName = 'asDateTime()';
                            break;
                        case 'asDecimal':
                            funcName = 'asDecimal()';
                            break;
                        case 'asFloat':
                            funcName = 'asFloat()';
                            break;
                        case 'asInteger':
                            funcName = 'asInteger()';
                            break;
                        case 'asList':
                            funcName = 'asList()';
                            break;
                        case 'asLong':
                            funcName = 'asLong()';
                            break;
                        case 'asString':
                            funcName = 'asString()';
                            break;
                        case 'charAt':
                            funcName = 'charAt(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'convert':
                            funcName = 'convert(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        case 'hash':
                            funcName = 'hash()';
                            break;
                        case 'indexOf':
                            funcName = 'indexOf(' + cExpr.arguments.map(e => this.toSql(e)).join(', ') + ')';
                            break;
                        default:
                            funcName = '[UndefinedFunction]';
                            break;
                    }
                    return this.toSql(cpaExpr.expression) + '.' + funcName;
                }
                break;
            case ts.SyntaxKind.ObjectLiteralExpression:
                const olExpr = expr as ts.ObjectLiteralExpression;

                return olExpr.properties.map(pr => {
                    switch (pr.kind) {
                        case ts.SyntaxKind.PropertyAssignment:
                            const prAs = pr as ts.PropertyAssignment;
                            const prNameObject = prAs.name as ts.Identifier;

                            return this.toSql(prAs.initializer) + ' as ' + prNameObject.text;
                        default:
                            return '[undefined]';
                    }
                }).join(',\n');
            case ts.SyntaxKind.ElementAccessExpression:
                const paExpr2 = expr as ts.ElementAccessExpression;
                const parent2 = paExpr2.expression;
                let t2 = '';
                if (parent2 && parent2.kind !== ts.SyntaxKind.Identifier) {
                    t2 = this.toSql(parent2);
                }
                const n = paExpr2.argumentExpression as ts.NumericLiteral;
                return t2 + '[' + n.text + ']';
            default:
                console.log(expr.kind);
                return '[undefined]';
        }
    }
}
