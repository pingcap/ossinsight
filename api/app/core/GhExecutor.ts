import {Octokit} from "octokit";
import {createPool, Pool} from "generic-pool";
import {DateTime} from "luxon";
import {ghQueryCounter, ghQueryTimer, measure} from "../metrics";
import CacheBuilder, { CacheProviderTypes } from "./cache/CacheBuilder";
import {CachedData} from "./cache/Cache";
import { eraseToken, OctokitFactory, SYMBOL_TOKEN } from "./OctokitFactory";

const GET_REPO_CACHE_HOURS = 1;
const SEARCH_REPOS_CACHE_HOURS = 24;

const RECOMMEND_REPO_LIST_1_KEYWORD = 'recommend-repo-list-1-keyword';
const RECOMMEND_REPO_LIST_1: RepoSearchItem[] = [
  { id: 41986369, fullName: 'pingcap/tidb' },
  { id: 10270250, fullName: 'facebook/react' },
  { id: 41881900, fullName: 'microsoft/vscode' },
  { id: 45717250, fullName: 'tensorflow/tensorflow' },
  { id: 1863329, fullName: 'laravel/laravel' },
  { id: 20580498, fullName: 'kubernetes/kubernetes' },
  { id: 60246359, fullName: 'ClickHouse/ClickHouse' },
];

const RECOMMEND_REPO_LIST_2_KEYWORD = 'recommend-repo-list-2-keyword';
const RECOMMEND_REPO_LIST_2: RepoSearchItem[] = [
  { id: 48833910, fullName: 'tikv/tikv' },
  { id: 11730342, fullName: 'vuejs/vue' },
  { id: 4164482, fullName: 'django/django' },
  { id: 27193779, fullName: 'nodejs/node' },
  { id: 65600975, fullName: 'pytorch/pytorch' },
  { id: 8514, fullName: 'rails/rails' },
  { id: 16563587, fullName: 'cockroachdb/cockroach' },
];

// Select from GitHub stars:
// https://stars.github.com/profiles/?contributionType=OPEN_SOURCE_PROJECT
const RECOMMEND_USER_LIST_KEYWORD = 'recommend-user-list-keyword';
const RECOMMEND_USER_LIST: UserSearchItem[] = [
  { id: 8255800, login: '521xueweihan'},
  { id: 960133, login: 'ahmadawais'},
  { id: 6358735, login: 'alexellis'},
  { id: 9877145, login: 'amitshekhariitbhu'},
  { id: 33576047, login: 'AnaisUrlichs'},
  { id: 2841780, login: 'AnandChowdhary'},
  { id: 31996, login: 'avelino'},
  { id: 43912004, login: 'Ba4bes'},
  { id: 177011, login: 'bagder'},
  { id: 2212006, login: 'bahmutov'},
  { id: 20332240, login: 'bhattbhavesh91'},
  { id: 40367173, login: 'ceceliacreates'},
  { id: 4585708, login: 'codeaholicguy'},
  { id: 20538832, login: 'Developerayo'},
  { id: 594614, login: 'driesvints'},
  { id: 624760, login: 'eddiejaoude'},
  { id: 373344, login: 'end3r'},
  { id: 293241, login: 'erikaheidi'},
  { id: 2900833, login: 'estruyf'},
  { id: 1592663, login: 'f213'},
  { id: 347387, login: 'felipenmoura'},
  { id: 121766, login: 'feross'},
  { id: 94096, login: 'filhodanuvem'},
  { id: 83657, login: 'foosel'},
  { id: 481677, login: 'geerlingguy'},
  { id: 1271146, login: 'gep13'},
  { id: 1361891, login: 'huan'},
  { id: 11148726, login: 'isabelcosta'},
  { id: 2492783, login: 'JanDeDobbeleer'},
  { id: 1323708, login: 'JLLeitschuh'},
  { id: 5204009, login: 'julioarruda'},
  { id: 4921183, login: 'kamranahmedse'},
  { id: 20041231, login: 'krishnaik06'},
  { id: 17781315, login: 'lauragift21'},
  { id: 15874598, login: 'Layla-P'},
  { id: 6364586, login: 'LayZeeDK'},
  { id: 19956731, login: 'levxyca'},
  { id: 316371, login: 'lirantal'},
  { id: 10111, login: 'mattn'},
  { id: 30733, login: 'matz'},
  { id: 59130, login: 'mheap'},
  { id: 1561955, login: 'midudev'},
  { id: 22009, login: 'mumoshu'},
  { id: 16105680, login: 'nikhita'},
  { id: 35298207, login: 'NishkarshRaj'},
  { id: 390146, login: 'outsideris'},
  { id: 779050, login: 'Ovilia'},
  { id: 357872, login: 'patriksvensson'},
  { id: 30669761, login: 'perriefidelis'},
  { id: 8278033, login: 'potatoqualitee'},
  { id: 29900845, login: 'risenW'},
  { id: 62059002, login: 'Ruth-ikegah'},
  { id: 6048601, login: 'samswag'},
  { id: 11923975, login: 'santoshyadavdev'},
  { id: 2197515, login: 'saracope'},
  { id: 6916170, login: 'segunadebayo'},
  { id: 4660275, login: 'sobolevn'},
  { id: 669383, login: 'stolinski'},
  { id: 6764957, login: 'sw-yx'},
  { id: 56883, login: 'Swizec'},
  { id: 924196, login: 'TomasVotruba'},
  { id: 1935960, login: 'Tyrrrz'},
  { id: 4331491, login: 'vanessamarely'},
  { id: 20594326, login: 'vinitshahdeo'},
  { id: 12409541, login: 'Wabri'},
  { id: 3991845, login: 'willianjusten'}
];

export interface UserSearchItem {
  id: number;
  login: string;
}

export interface RepoSearchItem {
  id: number;
  fullName: string;
}

export enum UserType {
  USER = 'user',
  ORG = 'org'
}

export interface UserSearchParam {
  keyword: string;
  type?: UserType;
}

function randomSelectFromList(list: Array<any>, n: number) {
  if (!Array.isArray(list)) return [];

  if (list.length < n) {
    return list;
  }

  const result = new Set();
  while (result.size < n) {
    const index =  Math.floor(Math.random() * list.length);
    result.add(list[index])
  }

  return Array.from(result);
}

export default class GhExecutor {
  private octokitPool: Pool<Octokit>

  constructor(
    tokens: string[] = [],
    public readonly cacheBuilder: CacheBuilder
  ) {
    this.octokitPool = createPool(new OctokitFactory(tokens), {
      min: 0,
      max: tokens.length
    })
    this.octokitPool
      .on('factoryCreateError', function (err) {
        console.error('factoryCreateError', err)
      })
      .on('factoryDestroyError', function (err) {
        console.error('factoryDestroyError', err)
      })
  }

  getRepo (owner: string, repo: string) {
    const cacheKey = `gh:get_repo:${owner}_${repo}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, GET_REPO_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`get repo ${owner}/${repo}`)
        ghQueryCounter.labels({ api: 'getRepo', phase: 'start' }).inc();

        try {
          const start = DateTime.now();
          const {data} = await measure(
            ghQueryTimer.labels({api: 'getRepo'}),
            () => octokit.rest.repos.get({repo, owner})
          )
          const end = DateTime.now();
          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
          ghQueryCounter.labels({api: 'getRepo', phase: 'success'}).inc();

          return {
            requestedAt: start,
            finishedAt: end,
            data: data,
            with: eraseToken(value)
          }
        } catch (e) {
          ghQueryCounter.labels({ api: 'getRepo', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }

  searchRepos(keyword: string):Promise<CachedData<RepoSearchItem>> {
    const cacheKey = `gh:search_repos:${keyword}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, SEARCH_REPOS_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search repos by keyword ${keyword}`)
        const start = DateTime.now();

        // Recommend list.
        if (keyword === RECOMMEND_REPO_LIST_1_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: RECOMMEND_REPO_LIST_1
          })
        } else if (keyword === RECOMMEND_REPO_LIST_2_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: RECOMMEND_REPO_LIST_2
          })
        }

        const variables = {
          q: keyword,
        }

        // Reference:
        // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
        // - https://docs.github.com/en/graphql/reference/objects#repository
        const query = /* GraphQL */ `
            query searchRepository($q: String!){
                search(query: $q, first: 10, type: REPOSITORY) {
                    codeCount
                    nodes {
                        ...on Repository {
                            databaseId
                            nameWithOwner
                        }
                    }
                }
            }
        `
        let formattedData: any[] = []

        ghQueryCounter.labels({ api: 'searchRepos', phase: 'start' }).inc()

        try {
          const data: any = await measure(
            ghQueryTimer.labels({api: 'searchRepos'}),
            () => octokit.graphql(query, variables)
          )
          ghQueryCounter.labels({api: 'searchRepos', phase: 'success'}).inc()

          data.search.nodes.forEach((repo: any) => formattedData.push({
            id: repo.databaseId,
            fullName: repo.nameWithOwner,
          }));

          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!;
          return {
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: formattedData,
            with: eraseToken(value)
          }
        } catch (e) {
          ghQueryCounter.labels({ api: 'searchRepos', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }

  searchUsers(keyword: string, type?: UserType):Promise<CachedData<UserSearchItem>> {
    const cacheKey = `gh:search_users:${keyword}`;
    const cache = this.cacheBuilder.build(
        CacheProviderTypes.CACHED_TABLE, cacheKey, SEARCH_REPOS_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search users by keyword ${keyword}`)
        const start = DateTime.now();

        // Recommend list.
        if (keyword === RECOMMEND_USER_LIST_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: randomSelectFromList(RECOMMEND_USER_LIST, 10)
          })
        }

        let q = keyword;
        if (type === UserType.USER) {
          q += ' type:user';
        } else if (type === UserType.ORG) {
          q += ' type:org';
        }

        const variables = {
          q: q,
        }

        // Reference:
        // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
        // - https://docs.github.com/en/graphql/reference/objects#user
        const query = /* GraphQL */ `
          query searchUsers($q: String!){
            search(query: $q, first: 10, type: USER) {
              codeCount
              nodes {
                ...on User {
                  databaseId
                  login
                }
              }
            }
          }
        `
        let formattedData: any[] = []

        ghQueryCounter.labels({ api: 'searchUsers', phase: 'start' }).inc()

        try {
          const data: any = await measure(
              ghQueryTimer.labels({api: 'searchUsers'}),
              () => octokit.graphql(query, variables)
          )
          ghQueryCounter.labels({api: 'searchUsers', phase: 'success'}).inc()

          data.search.nodes.forEach((repo: any) => formattedData.push({
            id: repo.databaseId,
            login: repo.login,
          }));

          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!;
          return {
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: formattedData,
            with: eraseToken(value)
          }
        } catch (e) {
          ghQueryCounter.labels({ api: 'searchUsers', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }
}

