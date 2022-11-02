import { dataset, itemTooltip, legend, title, utils } from '../options';
import { withChart } from '../chart';
import { d3Hierarchy, D3HierarchyItem } from '../options/custom/d3-hierarchy';
import { template } from '../options/utils';
import xss from 'xss';

// lines of code
export type CompanyData = {
  company_name: string;
};

export const CompaniesChart = withChart<CompanyData, { valueIndex: string }>(({
  title: propsTitle,
  data,
}, chartProps) => {
  const { dataset: ds, series } = utils.aggregate<CompanyData>((all, names) => {
    let index = 0;
    const res = all.flatMap((data, i) =>
      transformCompanyData(data.data?.data ?? [], chartProps?.valueIndex)
        .map(item => {
          item.id = `${i}-${item.name}`;
          item.index = index++;
          item.color = ['#dd6b66', '#759aa0'][i];
          return item;
        }),
    ).concat([{
      id: 'root',
      name: '',
      depth: 0,
      value: 0,
      index: -1,
      parentId: '',
    }]);
    // TEMP FIX: https://github.com/pingcap/ossinsight/issues/237
    if (res.length < 51) {
      res.push(...(new Array(51 - res.length).fill(0).map((_, i) => ({
        id: `ph-${i}`,
        name: '',
        depth: 1,
        value: 0,
        index: -1,
        parentId: 'root',
      }))));
    }
    const series = d3Hierarchy(res, 1);
    return {
      dataset: dataset(undefined, res),
      series,
    };
  });
  return {
    title: title(propsTitle),
    dataset: ds,
    legend: legend({
      icon: 'circle',
      selectedMode: false,
    }),
    tooltip: itemTooltip({
      formatter: params => `${params.value.name as string}: ${params.value.value as string}`,
    }),
    hoverLayerThreshold: Infinity,
    series: [
      ...template(({ name }) => ({ type: 'custom', name, color: [], coordinateSystem: 'none' })),
      series,
    ],
  };
}, {
  aspectRatio: 16 / 9,
});

function transformCompanyData (data: CompanyData[], valueIndex: string | undefined): D3HierarchyItem[] {
  if (!valueIndex) {
    return [];
  }
  return data.flatMap((item, index) => ({
    id: '',
    group: '',
    name: xss(item.company_name),
    depth: 1,
    value: item[valueIndex],
    index: 0,
    parentId: 'root',
  }));
}
