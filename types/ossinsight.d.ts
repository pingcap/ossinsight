declare module '@ossinsight/api' {

  export interface SearchRepoInfo {
    id: number
    fullName: string
  }

  export interface RepoInfo {
    id: number
    full_name: string
    forks: number
    open_issues: number
    subscribers_count: number
    watchers: number
    language: string
    owner: {
      avatar_url: string
      html_url: string
      login: string
    }
  }

  export interface UserInfo {
    id: number
    login: string
  }

  export type Collection = {
    id: number
    name: string
    slug: string
    public: 0 | 1
  }

  export type UserType = 'user' | 'org'
}