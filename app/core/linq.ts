import * as ts from 'typescript';

export default class Collection<T> {
    private className: string;
    private executionFunction: (cmd: string) => Promise<T> | Promise<T[]>;

    private selectQuery: (t: T) => any;
    private whereQuery: (t: T) => boolean;
    private orderByQuery: (t: T) => any;

    constructor(classn: string, executefn: (cmd: string) => Promise<T> | Promise<T[]>) {
        this.className = classn;
        this.executionFunction = executefn;
    }

    public where(query: (t: T) => boolean): Collection<T> {
        this.whereQuery = query;
        return this;
    }

    public orderBy(query: (t: T) => any): Collection<T> {
        this.orderByQuery = query;
        return this;
    }

    public select(query: (t: T) => any): Collection<T> {
        this.selectQuery = query;
        return this;
    }

    public execute(): Promise<T> | Promise<T[]> {
       return this.executionFunction(this.getSql());
    }

    private getSql(): string {
        let selectString = this.queryToSql(this.selectQuery);
        const whereString = this.queryToSql(this.whereQuery);
        const orderByString = this.queryToSql(this.orderByQuery);

        if (selectString.length === 0) {
            selectString = '*';
        }

        let ret =  'SELECT ' + selectString + ' FROM ' + this.className + ' ';

        if (whereString.length > 0) {
            ret += 'WHERE ' + whereString + '\n';
        }
        if (orderByString.length > 0) {
            ret += 'ORDER BY ' + orderByString;
        }
        return ret;
    }

    private queryToSql(query: (t: T) => boolean): string {
        if (query) {
            const src = ts.createSourceFile('test.ts', query.toString(), ts.ScriptTarget.ES2016, false);
            const expr = src.statements[0] as ts.ExpressionStatement;
            const arrFunc = expr.expression as ts.ArrowFunction;

            return this.toSql(arrFunc.body);
        }
        return '';
    }

    private toSql(expr: ts.Node): string {
        switch (expr.kind) {
            case ts.SyntaxKind.PropertyAccessExpression:
                const paExpr = expr as ts.PropertyAccessExpression;
                const idObject = paExpr.expression as ts.Identifier;
                return paExpr.name.text;
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
                            funcName = 'UPPER';
                            break;
                        case 'toLowerCase':
                            funcName = 'LOWER';
                            break;
                        case 'substring':
                            funcName = 'SUBSTRING';
                            args = ', ' + cExpr.arguments.map(e => this.toSql(e)).join(', ');
                            break;
                        default:
                            funcName = '[UndefinedFunction]';
                            break;
                    }
                    return funcName + '(' + this.toSql(cpaExpr.expression) + args + ')';
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
            default:
                return '[undefined]';
        }
    }

}
