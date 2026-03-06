
export function allExists (required: string[] | undefined, params: Record<string, string>): boolean {
  if (!required) {
    return true;
  }

  for (let key of required) {
    if (!(key in params)) {
      return false;
    }
  }

  return true;
}


export function setUrlParams(urlSearchParams: URLSearchParams, urlParams: Record<string, string>, parameters: Record<string, string | string[]>) {
  for (let [name, paramName] of Object.entries(urlParams)) {
    if (paramName in parameters) {
      const value = parameters[paramName];
      if (Array.isArray(value)) {
        value.forEach((value) => {
          urlSearchParams.append(name, value);
        });
        continue;
      }
      value && urlSearchParams.set(name, value);
    }
  }
}
