import {QuerySchema} from "@ossinsight/types";
import {BadParamsError, ParamItemType, ParamItemTypes, ParamType, ParamTypes} from "./QueryParser";

export class QueryLegacyParser {

    constructor() {}

    async parse(templateSQL: string, queryConfig: QuerySchema, values: Record<string, any>) {
        for (const param of queryConfig.params) {
            const {
                name,
                replaces,
                template,
                default: defaultValue,
                type = ParamTypes.STRING,
                pattern,
                itemType,
                maxArrayLength
            } = param;
            const value = values[name] ?? defaultValue;
            values[name] = value;
    
            let replaceValue;
            if (type === ParamTypes.ARRAY) {
                replaceValue = this.processArrayValue(name, value, pattern, template, itemType, maxArrayLength);
            } else {
                replaceValue = this.verifyParamValue(name, value, pattern, template);
            }

            templateSQL = templateSQL.replaceAll(replaces, replaceValue);
        }
        return templateSQL;
    }

    private processArrayValue(
      name: string, values: any | any[], pattern?: string, paramTemplate?: Record<string, string>,
      itemType: ParamItemType = ParamItemTypes.STRING, maxArrayLength: number = 10
    ): string {
        const arrayValue = Array.isArray(values) ? values : [values];

        if (arrayValue.length > maxArrayLength) {
            throw new BadParamsError(name, `The length of the array ${name} is too long (max length: ${maxArrayLength}).`);
        }

        return arrayValue
          .map((itemValue) => {
              return this.verifyParamValue(name, itemValue, pattern, paramTemplate);
          })
          .map((itemValue) => {
              return this.stringifyParamValue(itemType, itemValue);
          }).join(', ');
    }

    private verifyParamValue(name: string, value: any, pattern?: string, paramTemplate?: Record<string, string>) {
        // All parameters are required by default.
        if (!value) {
            throw new BadParamsError(name, `The parameter <${name}> is undefined.`);
        }

        if (pattern) {
            const regexp = new RegExp(pattern);
            if (!regexp.test(String(value))) {
                throw new BadParamsError(name, `The data format of the parameter <${name}> is incorrect (value: ${value}).`);
            }
        }

        let targetValue;
        if (paramTemplate) {
            targetValue = paramTemplate[String(value)];
            if (targetValue === undefined || targetValue === null) {
                throw new BadParamsError(name, `Parameter value <${value}> doesn't have matching template.`);
            }
        } else {
            targetValue = value;
            if (targetValue === undefined || targetValue === null) {
                throw new BadParamsError(name, `Require parameter <${name}> not found.`);
            }
        }

        return targetValue;
    }

    private stringifyParamValue(type: ParamType, value: any): string {
        switch (type) {
            case ParamItemTypes.STRING:
                return `'${value}'`;
            case ParamItemTypes.INTEGER:
            case ParamItemTypes.NUMBER:
                return `${ typeof value === 'string' ? Number(value) : value}`;
            case ParamItemTypes.BOOLEAN:
                return value ? '1' : '0';
            default:
                throw new Error('unknown param type ' + type);
        }
    }

}