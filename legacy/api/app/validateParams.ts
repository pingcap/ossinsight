interface Params {
  [key: string]: ((val: string) => boolean) | RegExp
}

export const params: Params = {
  repo: /^[a-z_]+_repos$/,
  n: /^[125]0$/,
  years: /^1|2|5|10$/,
  action: /^opened|closed$/,
  merged: /^true|\*$/,
  year: year => {
    const n = parseInt(year)
    return n >= 2011 && n < 2030
  },
  event: /^(Watch|PullRequest|Fork)Event$/
}
