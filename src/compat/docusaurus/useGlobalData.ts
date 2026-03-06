type PrefetchData = {
  collections: { data: any[] };
  eventsTotal: { data: Array<{ cnt: number }> };
};

const pluginPrefetch: PrefetchData = {
  collections: { data: [] },
  eventsTotal: { data: [{ cnt: 0 }] },
};

export function usePluginData(id: string): unknown {
  if (id === "plugin-prefetch") {
    return pluginPrefetch;
  }
  return {};
}

export default function useGlobalData() {
  return {
    "plugin-prefetch": pluginPrefetch,
  };
}
