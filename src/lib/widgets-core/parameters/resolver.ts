import { collectionsPromise } from '@/lib/ui/components/CollectionSelector/utils';
import { ParameterDefinitions } from '@ossinsight/widgets-types';
import { handleOApi } from '../utils/oapi';
import parsers from './parser';

export type LinkedData = {
  repos: Record<string, { id: number, fullName: string, defaultBranch: string }>
  users: Record<string, { id: number, login: string }>
  orgs: Record<string, { id: number, login: string }>
  collections: Record<string, { id: number, name: string, public: boolean }>
}

export type PendingLinkedData = {
  [P in keyof LinkedData]: {
    [K in keyof LinkedData[P]]?: Promise<LinkedData[P][K]>
  }
}

function withPending (linkedData: LinkedData): LinkedData & { pending: PendingLinkedData } {
  if (!('pending' in linkedData)) {
    (linkedData as any).pending = {
      repos: {},
      users: {},
      orgs: {},
      collections: {},
    };
  }
  return linkedData as any;
}

export async function resolveParameters (definitions: ParameterDefinitions, params: Record<string, string | string[]>, defaultLinkedData?: LinkedData, signal?: AbortSignal) {
  const linkedData = withPending(defaultLinkedData ?? {
    repos: {},
    users: {},
    orgs: {},
    collections: {},
  });
  const results = await Promise.allSettled(Object.entries(definitions).map(([name, def]) => {
    let originParam: string | number | string[] | number[] = params[name];
    if (originParam == null) {
      return Promise.resolve();
    }
    const parse = parsers[def.type];
    originParam = parse?.(originParam, def as any) ?? originParam;
    // Note that we only use the last param for now
    const param = typeof originParam === 'object' ? originParam[originParam.length - 1] : originParam;
    switch (def.type) {
      case 'repo-id':
        if (param) {
          if (linkedData.repos[param]) return Promise.resolve();
          if (linkedData.pending.repos[param]) return linkedData.pending.repos[param];
          return linkedData.pending.repos[param] = fetch(`https://api.ossinsight.io/gh/repositories/${param}`, { signal })
            .then(handleOApi)
            .then((data) => {
              return linkedData.repos[param] = {
                id: param as number,
                fullName: data.full_name,
                defaultBranch: data.default_branch,
              };
            })
            .finally(() => {
              delete linkedData.pending.repos[param];
            });
        }
        break;
      case 'user-id':
        if (param) {
          if (linkedData.users[param]) return Promise.resolve();
          if (linkedData.pending.users[param]) return linkedData.pending.users[param];
          return linkedData.pending.users[param] = fetch(`https://api.ossinsight.io/gh/user/${param}`, { signal })
            .then(handleOApi)
            .then((data) => {
              return linkedData.users[param] = {
                id: param as number,
                login: data.login,
              };
            })
            .finally(() => {
              delete linkedData.pending.users[param];
            });
        }
        break;
      case 'owner-id':
        if (param) {
          if (linkedData.orgs[param]) return Promise.resolve();
          if (linkedData.pending.orgs[param]) return linkedData.pending.orgs[param];
          return linkedData.pending.orgs[param] = fetch(`https://api.ossinsight.io/gh/user/${param}`, { signal })
            .then(handleOApi)
            .then((data) => {
              return linkedData.orgs[param] = {
                id: param as number,
                login: data.login,
              };
            })
            .finally(() => {
              delete linkedData.pending.orgs[param];
            });
        }
        break;
      case 'collection-id':
        if (param) {
          if (linkedData.collections[param]) return Promise.resolve();
          if (linkedData.pending.collections[param]) return linkedData.pending.collections[param];
          return linkedData.pending.collections[param] = collectionsPromise
            .then((res) => res.find((collection) => collection.id === param))
            .then((collection) => {
              return linkedData.collections[param] = collection ?? { id: parseInt(param as any), public: false, name: 'Unknown' };
            })
            .finally(() => {
              delete linkedData.pending.collections[param];
            });
        }
        break;
      case 'repo-ids':
        if (originParam) {
          const originParamList = Array.isArray(originParam)
            ? originParam
            : [originParam];
          const filteredOriginParamList = originParamList.filter((param) => {
            if (linkedData.repos[param]) return false;
            if (linkedData.pending.repos[param]) return false;
            return true;
          });
          if (filteredOriginParamList.length === 0) return Promise.resolve();
          const originParamListStr = filteredOriginParamList.join(',');
          if (linkedData.pending.repos[originParamListStr]) return linkedData.pending.repos[originParamListStr];
          const urlSearchParams = new URLSearchParams();
          filteredOriginParamList.forEach((param) => {
            urlSearchParams.append('repoId', String(param));
          });
          return (linkedData.pending.repos[originParamListStr] = fetch(
            `https://api.ossinsight.io/q/repos?${urlSearchParams.toString()}`,
            { signal }
          )
            .then(handleOApi)
            .then(
              (
                data: {
                  repo_id: number;
                  repo_name: string;
                  owner_id: number;
                  owner_login: string;
                  owner_is_org: 0 | 1;
                }[]
              ) => {
                data?.forEach((repo) => {
                  linkedData.repos[repo.repo_id] = {
                    id: repo.repo_id,
                    fullName: repo.repo_name,
                    defaultBranch: '',
                  };
                });

                return {
                  id: -1,
                  fullName: '',
                  defaultBranch: '',
                };
              }
            )
            .finally(() => {
              delete linkedData.pending.repos[originParamListStr];
            }));
        }
        break;
    }

    return Promise.resolve();
  }));

  results.forEach(e => {
    if (e.status === 'rejected') {
      console.error(e.reason);
    }
  });

  return linkedData;
}
