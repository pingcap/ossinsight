import {dataset, itemTooltip, legend, ORIGINAL_DATASET_ID, title, treemap} from '../options';
import {withChart} from '../chart';
import {d3Hierarchy, D3HierarchyItem} from '../options/custom/d3-hierarchy';

// lines of code
export type CompanyData = {
  company_name: string
  issue_creators: number
}

export const CompaniesChart = withChart<CompanyData>(({title: propsTitle, data}) => {
  const d3Data = transformCompanyData(data.data?.data ?? [])
  const option = d3Hierarchy(d3Data, 1)
  return {
    title: title(propsTitle),
    dataset: dataset(ORIGINAL_DATASET_ID, d3Data),
    tooltip: itemTooltip(),
    ...option,
  };
}, {
  aspectRatio: 16 / 9,
});

function transformCompanyData(data: CompanyData[]): D3HierarchyItem[] {
  return data.flatMap((item, index) => ({
    id: item.company_name,
    depth: 1,
    value: item.issue_creators,
    index: index + 1,
    parentId: 'root'
  })).concat([{
    id: 'root',
    depth: 0,
    value: 0,
    index: 0,
    parentId: ''
  }]);
}
