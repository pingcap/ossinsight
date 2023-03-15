import { DateTime, Duration } from "luxon";
import { QuerySchema } from "../../params.schema";
import CollectionService from "../services/CollectionService";
import GHEventService from "../services/GHEventService";
import UserService from "../services/UserService";

// TODO: make interface ParamHandler.

export enum ParamType {
    ARRAY = 'array',
    DATE_RANGE = 'date-range',
    COLLECTION = 'collection',
    EMPLOYEES = 'employees'
}

export enum ParamDateRange {
    LAST_HOUR = 'last_hour',
    LAST_DAY = 'last_day',
    LAST_WEEK = 'last_week',
    LAST_MONTH = 'last_month',
}

export enum ParamDateRangeTo {
    NOW = 'now',
    LAST_VALID_DATETIME = 'last_valid_datetime',
}

export class BadParamsError extends Error {
    readonly msg: string
    constructor(public readonly name: string, message: string) {
        super(message);
        this.msg = message
    }
}

export async function buildParams(
    template: string, querySchema: QuerySchema, values: Record<string, any>,
    ghEventService: GHEventService, collectionService: CollectionService, userService: UserService
) {
    for (const param of querySchema.params) {
        const {
            name, replaces, template: paramTemplate, dateRangeTo = ParamDateRangeTo.LAST_VALID_DATETIME,
            default: defaultValue, type, column, pattern
        } = param;
        const value = values[name] ?? defaultValue;

        let targetValue = "";
        switch (type) {
            case ParamType.ARRAY:
                targetValue = handleArrayValue(name, value, column, pattern, paramTemplate)
                break;
            case ParamType.DATE_RANGE:
                targetValue = await handleDateRangeValue(name, value, ghEventService, dateRangeTo, column, pattern, paramTemplate)
                break;
            case ParamType.COLLECTION:
                targetValue = await handleCollectionValue(name, value, collectionService, column, pattern, paramTemplate)
                break;
                case ParamType.EMPLOYEES:
                targetValue = await handleEmployeeValue(name, value, userService, column, pattern, paramTemplate)
                break;
            default:
                targetValue = verifyParam(name, value, pattern, paramTemplate);
        }
        template = template.replaceAll(replaces, targetValue);
    }
    return template
}

function handleArrayValue(name: string, value: any, column?: string, pattern?: string, paramTemplate?: Record<string, string>) {
    const arrValues = [];

    if (Array.isArray(value)) {
        for (let v of value) {
        const targetValue = verifyParam(name, v, pattern, paramTemplate);
        arrValues.push(targetValue);
        }
    } else {
        const targetValue = verifyParam(name, value, pattern, paramTemplate);
        arrValues.push(targetValue);
    }

    return arrValues.join(', ');
}

async function handleDateRangeValue(
    name: string, value: any, ghEventService: GHEventService, dateRangeTo?: string, column?: string,
    pattern?: string, paramTemplate?: Record<string, string>
) {
    const verifiedValue = verifyParam(name, value, pattern, paramTemplate);

    let to = DateTime.now();
    if (dateRangeTo === ParamDateRangeTo.LAST_VALID_DATETIME) {
        to = DateTime.fromFormat(await ghEventService.getMaxEventTime(), "yyyy-MM-dd HH:mm:ss");
    }

    let from = to;
    if (verifiedValue === ParamDateRange.LAST_HOUR) {
        from = to.minus(Duration.fromObject({ 'hours': 1 }))
    } else if (verifiedValue === ParamDateRange.LAST_DAY) {
        from = to.minus(Duration.fromObject({ 'days': 1 }))
    } else if (verifiedValue === ParamDateRange.LAST_WEEK) {
        from = to.minus(Duration.fromObject({ 'weeks': 1 }))
    } else if (verifiedValue === ParamDateRange.LAST_MONTH) {
        from = to.minus(Duration.fromObject({ 'months': 1 }))
    }

    return `${column} >= '${from.toSQL()}' AND ${column} <= '${to.toSQL()}'`
}

async function handleCollectionValue(
    name: string, collectionId: number, collectionService: CollectionService, column?: string, pattern?: string, 
    paramTemplate?: Record<string, string>,
): Promise<string> {
    const arrValues = [];

    const res = await collectionService.getCollectionRepos(collectionId)

    if (Array.isArray(res.data) && res.data.length > 0) {
        for (let item of res.data) {
        const targetValue = verifyParam(name, item.repo_id, pattern, paramTemplate);
        arrValues.push(targetValue);
        }
    } else {
        throw new BadParamsError(name, `can not get repo for collection ${collectionId}`)
    }

    return arrValues.join(', ');
}

async function handleEmployeeValue(
    name: string, companyName: string, userService: UserService, column?: string, pattern?: string, 
    paramTemplate?: Record<string, string>,
): Promise<string> {
    const arrValues = [];
    const res = await userService.getCompanyEmployees(companyName)

    if (Array.isArray(res.data) && res.data.length > 0) {
        for (let item of res.data) {
        const targetValue = verifyParam(name, item.login, pattern, paramTemplate);
        arrValues.push(targetValue);
        }
    } else {
        throw new BadParamsError(name, `can not get employees for company ${companyName}`)
    }

    return arrValues.map((val) => `'${val}'`).join(', ');
}

function verifyParam(name: string, value: any, pattern?: string, paramTemplate?: Record<string, string>) {
    if (pattern) {
        const regexp = new RegExp(pattern);
        if (!regexp.test(String(value))) {
        throw new BadParamsError(name, 'bad param ' + name)
        }
    }

    const targetValue = paramTemplate ? paramTemplate[String(value)] : value;
    if (targetValue === undefined || targetValue === null) {
        throw new BadParamsError(name, 'require param ' + name)
    }

    return targetValue;
}
