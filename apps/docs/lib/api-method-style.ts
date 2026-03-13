const METHOD_BADGE_CLASS_NAMES: Record<string, string> = {
  DELETE: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  GET: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  HEAD: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  OPTIONS: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
  PATCH: 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300',
  POST: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  PUT: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
};

export function getApiMethodBadgeClassName(method: string) {
  return METHOD_BADGE_CLASS_NAMES[method.toUpperCase()] ?? 'border-fd-primary/20 bg-fd-primary/10 text-fd-primary';
}
