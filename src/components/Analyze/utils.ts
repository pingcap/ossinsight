import { handleOApi } from '@/lib/widgets-core/utils/oapi';

const API_SERVER = typeof window === 'undefined' ? 'https://api.ossinsight.io' : '';
const PATH_GET_ORG_INFO = `/q/get-user-by-login`;
const PATH_GET_ORG_OVERVIEW = `/q/orgs/overview`;
const PATH_GET_ORG_STARS_LOCATIONS = `/q/orgs/stars/locations`;
const PATH_GET_ORG_STARS_ORGS = `/q/orgs/stars/organizations`;
const PATH_GET_ORG_PARTICIPANT_LOCATIONS = `/q/orgs/participants/locations`;
const PATH_GET_ORG_PARTICIPANT_ORGS = `/q/orgs/participants/organizations`;
const PATH_GET_USERS = `/gh/users/`;
const PATH_GET_REPO_BY_ID = `/gh/repositories/`;
const PATH_GET_FILLED_RATIO = `/q/orgs/{activity}/{target}/completion-rate`;

export interface OwnerInfo {
  type: 'User' | 'Organization' | 'Bot';
  login: string;
  name: string;
  id: number;
  bio: string;
  public_repos: number;
}

export const getOwnerInfo = (owner: string): Promise<OwnerInfo> => {
  return fetch(`${API_SERVER}${PATH_GET_USERS}${encodeURIComponent(owner)}`)
    .then(handleOApi);
};

export const getOrgInfo = (login: string) => {
  return fetch(`${API_SERVER}${PATH_GET_ORG_INFO}?login=${login}`)
    .then(handleOApi);
};

export const getOrgOverview = (id: number, signal?: AbortSignal) => {
  return fetch(`${API_SERVER}${PATH_GET_ORG_OVERVIEW}?ownerId=${id}`, { signal })
    .then(handleOApi);
};

export const params2UrlSearch = (params: {
  [x: string | number]: string | number | Array<string | number>;
}) => {
  const usp = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const val = params[key];
    if (val == null) {
      return;
    }
    if (val instanceof Array) {
      val.forEach(item => usp.append(key, String(item)))
    } else {
      usp.set(key, String(val))
    }
  })

  return usp.toString();
};

export type StarLocationDataType = {
  country_code: string;
  stars: number;
};

export type ParticipantLocationDataType = {
  country_code: string;
  participants: number;
};

export const getOrgActivityLocations = (
  id: number,
  params: { activity: 'stars' | 'participants'; period?: string; role?: string, repoIds?: string[] },
  signal?: AbortSignal,
): Promise<StarLocationDataType[] | ParticipantLocationDataType[]> => {
  let path = PATH_GET_ORG_STARS_LOCATIONS;

  if (params.activity === 'participants') {
    path = PATH_GET_ORG_PARTICIPANT_LOCATIONS;
  }

  const paramsStr = params2UrlSearch({ ...params, ownerId: id });

  return fetch(`${API_SERVER}${path}?${paramsStr}`, { signal })
    .then(handleOApi);
};

export type ParticipateOrgDataType = {
  organization_name: string;
  participants: number;
};

export type StarOrgDataType = {
  organization_name: string;
  stars: number;
};

export const getOrgActivityOrgs = (
  id: number,
  params?: {
    period?: string;
    activity: 'stars' | 'participants';
    role?: string;
    repoIds?: string[];
  },
  signal?: AbortSignal,
): Promise<ParticipateOrgDataType[] | StarOrgDataType[]> => {
  const { activity = 'stars', ...restParams } = params || {};
  const paramsStr = params2UrlSearch({ ...restParams, ownerId: id });

  let path = PATH_GET_ORG_STARS_ORGS;
  if (activity === 'participants') {
    path = PATH_GET_ORG_PARTICIPANT_ORGS;
  }

  return fetch(`${API_SERVER}${path}?${paramsStr}`, { signal })
    .then(handleOApi);
};

export const getUserInfo = (login: string | number) => {
  return fetch(`${API_SERVER}${PATH_GET_USERS}${login}`)
    .then(handleOApi);
};

export const getCompletionRate = (
  id: number,
  params?: {
    period?: string;
    activity: 'stars' | 'participants';
    target: 'organizations' | 'locations';
    role?: string;
    repoIds?: string[];
  },
  signal?: AbortSignal
): Promise<{ percentage: number }[]> => {
  const allParams = { ...params, ownerId: id };
  const paramsStr = params2UrlSearch(allParams);
  let path = PATH_GET_FILLED_RATIO;
  path = path.replace('{activity}', params?.activity || 'stars');
  path = path.replace('{target}', params?.target || 'organizations');

  return fetch(`${API_SERVER}${path}?${paramsStr}`, { signal }).then(
    handleOApi
  );
};

// // ! TODO remove this, use getRepoInfoByOwnerId instead
// export const getRepoInfoById = (repoId: number | string) => {
//   return fetch(`${API_SERVER}${PATH_GET_REPO_BY_ID}${repoId}`)
//     .then(handleOApi)
//     .then((data) => ({
//       id: data.id,
//       fullName: data.full_name,
//       defaultBranch: data.default_branch,
//     }));
// };
