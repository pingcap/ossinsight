export function arrayDeepEquals(values: any[], compareValues: any[]) {
    if (!(Array.isArray(values) && Array.isArray(compareValues))) return false;
    if (values.length != compareValues.length) return false;
    for (const i in values) {
      if (values[i] != compareValues[i]) {
        return false;
      }
    }
    return true;
}