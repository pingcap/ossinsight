import {itemTooltip, title, treemap} from '../options';
import {withChart} from '../chart';

// lines of code
export type CompanyData = {
  company_name: string
  issue_creators: number
}

export const CompaniesChart = withChart<CompanyData>(({title: propsTitle, data}) => ({
  title: title(propsTitle),
  legend: {show: true},
  series: [
    treemap(transformCompanyData(data.data?.data ?? [])),
  ],
  tooltip: itemTooltip()
}), {
  aspectRatio: 16 / 9,
});

function transformCompanyData(data: CompanyData[]): ReturnType<typeof treemap>['data'] {
  return data.flatMap(item => ({
    name: item.company_name,
    value: item.issue_creators,
  }))
}
