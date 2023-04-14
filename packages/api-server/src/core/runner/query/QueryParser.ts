import {ConditionalRefreshCrons, QuerySchema} from "../../../types/query.schema";

export enum ParamType {
    ARRAY = 'array',
}

export enum ParamDateRange {
    LAST_HOUR = 'last_hour',
    LAST_DAY = 'last_day',
    LAST_WEEK = 'last_week',
    LAST_MONTH = 'last_month',
}

export enum ParamDateRangeTo {
    NOW = 'now'
}

export class BadParamsError extends Error {
    readonly msg: string
    constructor(public readonly name: string, message: string) {
        super(message);
        this.msg = message
    }
}

export class QueryParser {

    constructor() {}

    async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
        for (const param of queryConfig.params) {
            const {
                name, replaces, template: paramTemplate, default: defaultValue, type, column, pattern
            } = param;
            const value = values[name] ?? defaultValue;
    
            let targetValue = "";
            switch (type) {
                case ParamType.ARRAY:
                    targetValue = this.handleArrayValue(name, value, column, pattern, paramTemplate)
                    break;
                default:
                    targetValue = this.verifyParam(name, value, pattern, paramTemplate);
            }
            templateSQL = templateSQL.replaceAll(replaces, targetValue);
        }
        return templateSQL
    }

    private handleArrayValue(name: string, value: any, column?: string, pattern?: string, paramTemplate?: Record<string, string>) {
        const arrValues = [];
    
        if (Array.isArray(value)) {
            for (let v of value) {
                const targetValue = this.verifyParam(name, v, pattern, paramTemplate);
                arrValues.push(targetValue);
            }
        } else {
            const targetValue = this.verifyParam(name, value, pattern, paramTemplate);
            arrValues.push(targetValue);
        }
    
        return arrValues.join(', ');
    }

    private verifyParam(name: string, value: any, pattern?: string, paramTemplate?: Record<string, string>) {
        if (pattern) {
            const regexp = new RegExp(pattern);
            if (!regexp.test(String(value))) {
            throw new BadParamsError(name, 'bad param ' + name)
            }
        }

        const targetValue = paramTemplate ? paramTemplate[String(value)] : value;
        if (targetValue === undefined || targetValue === null) {
            throw new BadParamsError(name, 'require param ' + name + (paramTemplate ? ` template value '${value}' not found` : ''))
        }

        return targetValue;
    }

    resolveCrons(params: any, crons: string | ConditionalRefreshCrons | undefined): (string | undefined) {
        if (typeof crons === "string") {
            return crons;
        }
        if (!crons) {
            return undefined;
        }
        if (!params || !params[crons.param]) {
            return undefined;
        }
        const param = params[crons.param];
        for (const key in crons.on) {
            // equals or matches
            if (param === key || (new RegExp(key)).test(param)) {
                return crons.on[key];
            }
        }
        return undefined;
    }


}