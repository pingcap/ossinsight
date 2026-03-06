import {Params, QuerySchema} from "@ossinsight/types";
import {Liquid} from 'liquidjs';
import {ParamItemTypes, ParamTypes} from "./QueryParser";

export class QueryLiquidParser {

    private readonly engine = new Liquid();

    constructor() {}

    async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
        let context: Record<string, any> = {};
        for (const param of queryConfig.params) {
            const value = values[param.name] ?? param.default;

            if (param.type === ParamTypes.ARRAY) {
                const values = Array.isArray(value) ? value : [value];
                context[param.name] = values.map((itemValue: any) => {
                    return this.verifyParamValue(param, itemValue);
                });
            } else {
                context[param.name] = this.verifyParamValue(param, value);
            }

        }
        return await this.engine.parseAndRender(templateSQL, context, values);
    }

    verifyParamValue(param: Params, value: any) {
        const type = (param.type === ParamTypes.ARRAY ? param.itemType : param.type) || ParamTypes.STRING;
        let processedValue = value;
        switch (type) {
            case ParamItemTypes.BOOLEAN:
                if (value === 'true') {
                    processedValue = true;
                } else if (value === 'false') {
                    processedValue = false;
                } else if (typeof value === 'boolean') {
                    processedValue = value;
                } else {
                    throw new Error(`The parameter <${param.name}> is not a boolean.`);
                }
                break;
            case ParamItemTypes.NUMBER:
                const num = Number(value);
                if (value === null || Number.isNaN(num)) {
                    throw new Error(`The parameter <${param.name}> is not a number.`);
                }
                processedValue = num;
                break;
            case ParamItemTypes.INTEGER:
                const int = Number(value);
                if (value === null || Number.isNaN(int) || !Number.isInteger(int)) {
                    throw new Error(`The parameter <${param.name}> is not an integer.`);
                }
                processedValue = int;
                break;
            case ParamItemTypes.STRING:
                if (param.pattern) {
                    const regex = new RegExp(param.pattern);
                    if (!regex.test(value)) {
                        throw new Error(`The parameter <${param.name}> does not match the pattern "${param.pattern}".`);
                    }
                }
                break;
            default:
                throw new Error(`The parameter <${param.name}> has an unknown type.`);
        }

        if (Array.isArray(param.enums) && !param.enums.includes(processedValue)) {
            throw new Error(`The parameter <${param.name}> is not in the enums.`);
        }

        return processedValue;
    }

}