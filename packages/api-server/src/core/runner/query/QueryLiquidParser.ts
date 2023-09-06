import {QuerySchema} from "@ossinsight/types";
import {Liquid} from 'liquidjs';
import {ParamTypes} from "./QueryParser";

export class QueryLiquidParser {

    private readonly engine = new Liquid();

    constructor() {}

    async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
        let context: Record<string, any> = {};
        for (const param of queryConfig.params) {
            const value = values[param.name] ?? param.default;
            const { type = ParamTypes.STRING } = param;
            switch (type) {
                case ParamTypes.ARRAY:
                    context[param.name] = Array.isArray(value) ? value : [value];
                    break;
                case ParamTypes.BOOLEAN:
                    if (value === 'true') {
                        context[param.name] = true;
                    } else if (value === 'false') {
                        context[param.name] = false;
                    } else if (typeof value === 'boolean') {
                        context[param.name] = value;
                    } else {
                        throw new Error(`The parameter <${param.name}> is not a boolean.`);
                    }
                    break;
                case ParamTypes.NUMBER:
                    const num = Number(value);
                    if (value === null || Number.isNaN(num)) {
                        throw new Error(`The parameter <${param.name}> is not a number.`);
                    }
                    context[param.name] = num;
                    break;
                case ParamTypes.INTEGER:
                    const int = Number(value);
                    if (value === null || Number.isNaN(int) || !Number.isInteger(int)) {
                        throw new Error(`The parameter <${param.name}> is not an integer.`);
                    }
                    context[param.name] = int;
                    break;
                case ParamTypes.STRING:
                    if (param.pattern) {
                        const regex = new RegExp(param.pattern);
                        if (!regex.test(value)) {
                            throw new Error(`The parameter <${param.name}> does not match the pattern "${param.pattern}".`);
                        }
                    }
                    context[param.name] = value;
                    break;
                default:
                    throw new Error(`The parameter <${param.name}> has an unknown type.`);
            }

            if (Array.isArray(param.enums) && !param.enums.includes(context[param.name])) {
                throw new Error(`The parameter <${param.name}> is not in the enums.`);
            }
        }
        return await this.engine.parseAndRender(templateSQL, context, values);
    }



}