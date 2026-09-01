import { getQueryDataQuality, type QueryDataQuality } from '@/lib/data-quality';
import { getRepoEndpointNames } from '@/components/Analyze/Section/RepoChart/endpoints';
import { getOrgEndpointNames } from '@/components/Analyze/Section/OrgChart/endpoints';

/**
 * Resolve the data-quality tier of a chart widget from the preset queries it
 * reads.
 *
 * The classification is static (configs/data-quality/star-incident-queries.json)
 * and each widget already declares its endpoints, so this is derived from the
 * widget name rather than threaded through the runtime datasource: the two
 * parsers in lib/charts-core/datasource return only the rows, and reshaping
 * their contract to carry the marker would touch every chart widget for what is
 * a presentational concern.
 *
 * Org endpoint names may contain `{activity}`-style placeholders; those are
 * expanded against the classification list by prefix so that e.g.
 * `orgs/{activity}/trends` still matches `orgs/commits/trends`.
 *
 * A widget is as degraded as its worst endpoint.
 */
export function getWidgetDataQuality(widgetName: string): QueryDataQuality {
  const names = [...getRepoEndpointNames(widgetName), ...getOrgEndpointNames(widgetName)];
  if (names.length === 0) {
    return 'ok';
  }

  let worst: QueryDataQuality = 'ok';
  for (const name of names) {
    const quality = name.includes('{')
      ? getTemplateQuality(name)
      : getQueryDataQuality(name);
    if (quality === 'blocked') {
      return 'blocked';
    }
    if (quality === 'tainted') {
      worst = 'tainted';
    }
  }
  return worst;
}

/**
 * Worst tier across every classified query matching a templated endpoint, so a
 * widget that can render a degraded activity is treated as degraded.
 */
function getTemplateQuality(template: string): QueryDataQuality {
  const pattern = new RegExp(`^${template.replace(/\{[^}]+\}/g, '[^/]+')}$`);
  let worst: QueryDataQuality = 'ok';
  for (const name of listClassifiedQueries()) {
    if (!pattern.test(name)) continue;
    const quality = getQueryDataQuality(name);
    if (quality === 'blocked') return 'blocked';
    if (quality === 'tainted') worst = 'tainted';
  }
  return worst;
}

let cachedNames: string[] | undefined;
function listClassifiedQueries(): string[] {
  if (!cachedNames) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const lists = require('../../../configs/data-quality/star-incident-queries.json');
    cachedNames = [...(lists.blocked ?? []), ...(lists.tainted ?? [])];
  }
  return cachedNames;
}
