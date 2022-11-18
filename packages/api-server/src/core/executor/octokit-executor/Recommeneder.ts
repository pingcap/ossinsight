import type { RepoSearchItem, UserSearchItem } from "./GhExecutor";

export const RECOMMEND_REPO_LIST_1_KEYWORD = 'recommend-repo-list-1-keyword';
const RECOMMEND_REPO_LIST_1: RepoSearchItem[] = [
  { id: 41986369, fullName: 'pingcap/tidb' },
  { id: 10270250, fullName: 'facebook/react' },
  { id: 41881900, fullName: 'microsoft/vscode' },
  { id: 45717250, fullName: 'tensorflow/tensorflow' },
  { id: 1863329, fullName: 'laravel/laravel' },
  { id: 20580498, fullName: 'kubernetes/kubernetes' },
  { id: 60246359, fullName: 'ClickHouse/ClickHouse' },
];

export const RECOMMEND_REPO_LIST_2_KEYWORD = 'recommend-repo-list-2-keyword';
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
export const RECOMMEND_USER_LIST_KEYWORD = 'recommend-user-list-keyword';
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

export function getRecommendRepoList(keyword: string) {
    if (keyword === RECOMMEND_REPO_LIST_1_KEYWORD) {
        return RECOMMEND_REPO_LIST_1;
      } else if (keyword === RECOMMEND_REPO_LIST_2_KEYWORD) {
        return RECOMMEND_REPO_LIST_2;
    }
}

export function getRecommendUserList() {
    return randomSelectFromList(RECOMMEND_USER_LIST, 10);
}