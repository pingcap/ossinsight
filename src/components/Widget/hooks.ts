import { createShareInfo } from '@/components/Share/utils';
import { widgetMetadataGenerator, widgetParameterDefinitions } from '@/utils/widgets';
import { AnalyzeTuple } from '@/lib/ui/components/AnalyzeSelector';
import { ShareOptions } from '@/lib/ui/components/ShareBlock';
import { ParametersContext } from '@/lib/widgets-core/parameters/react/context';
import { resolveParameters } from '@/lib/widgets-core/parameters/resolver';
import { createWidgetContext } from '@/lib/widgets-core/utils/context';
import { useContext, useEffect, useMemo, useState, useTransition } from 'react';

export function useWidgetShareInfo (fullName: string | undefined, tuple: AnalyzeTuple) {
  const [shareInfo, setShareInfo] = useState<ShareOptions>();
  const [params, setParams] = useState<any>();
  const [transitioning, startTransition] = useTransition();
  const [waiting, setWaiting] = useState(true);

  const { linkedData } = useContext(ParametersContext);

  useEffect(() => {
    setWaiting(true);
    startTransition(async () => {
      setShareInfo(undefined);
      setParams(undefined);
      if (fullName == null || tuple.value == null) {
        setWaiting(false);
        return;
      }
      const parameters = await widgetParameterDefinitions(fullName);
      let flag = false;
      let skip = false;
      const params = Object.entries(parameters).reduce((res, [k, v]) => {
        if (!flag && v.type === 'repo-id' && tuple.type === 'repo' && tuple.value != null) {
          res[k] = tuple.value.id;
          flag = true;
        } else if (!flag && v.type === 'user-id' && tuple.type === 'user' && tuple.value != null) {
          res[k] = tuple.value.id;
          flag = true;
        } else if (['user-id', 'repo-id'].includes(v.type)) {
        } else if (v.default != null) {
          res[k] = v.default;
        }
        return res;
      }, {} as any);
      if (skip) {
        setWaiting(false);
        return;
      }

      await resolveParameters(parameters, params, linkedData);
      setShareInfo(await createShareInfo(fullName, linkedData, params));
      setParams(params);
      setWaiting(false);
    });
  }, [fullName, tuple.type, tuple.value, linkedData]);

  const editReadmeUrl = useMemo(() => {
    if (!tuple.value) {
      return undefined;
    }
    switch (tuple.type) {
      case 'repo': {
        const repo = linkedData.repos[String(tuple.value.id)];
        if (!repo) {
          return undefined;
        }
        const { fullName, defaultBranch } = repo;
        return `https://github.com/${fullName}/edit/${defaultBranch}/README.md`;
      }
      case 'user': {
        const login = linkedData.users[String(tuple.value.id)]?.login;
        if (!login) {
          return undefined;
        }
        return `https://github.com/${login}/${login}`;
      }
      default:
        return undefined;
    }
  }, [waiting, transitioning, tuple.type, tuple.value?.id]);

  return {
    shareInfo,
    params,
    editReadmeUrl,
    loading: waiting || transitioning,
  };
}

export function useWidgetTitle (widget: string) {
  const [name, setName] = useState('');
  const [transition, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [metadataGenerator, params] = await Promise.all([
        widgetMetadataGenerator(widget),
        widgetParameterDefinitions(widget),
      ]);

      const parameters: any = {};
      Object.entries(params).forEach(([key, config]) => {
        if (config.default != null) {
          parameters[key] = config.default;
        }
      });

      const metadata = metadataGenerator({
        ...createWidgetContext('client', parameters, null as any),
        getCollection () { return { id: 0, name: 'Collection', public: true }; },
        getRepo () { return { id: 0, fullName: 'Repository' }; },
        getUser () { return { id: 0, login: 'Developer' };},
        getOrg () { return { id: 0, login: 'Organization' }; },
        getTimeParams () { return { zone: 'TimeZone', period: 'Period' }; },
      });

      setName(metadata.title ?? 'Untitled');
    });
  }, [widget]);

  return {
    name,
    loading: transition || !name,
  } as { loading: true, name: undefined } | { loading: false, name: string };
}
