import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useMemoizedFn } from 'ahooks';

type GAConfiguredMetrics = {
  spent: number;
};

type GAConfiguredDimensions = {
  questionId: string;
  questionTitle: string;
  questionHitCache: boolean | undefined;
  questionRecommended: boolean;
  questionStatus: string;
  questionNotClear: boolean;
  questionHasAssumption: boolean;
  questionSqlCanAnswer: boolean | undefined;
  errorMessage: string;
  // trigger-login, login-failed, login-success
  trigger_login_by: string | undefined;
};

type GAConfiguredOptions = GAConfiguredDimensions & GAConfiguredMetrics;
type GaEvent<T extends keyof GAConfiguredOptions> = { [P in T]: GAConfiguredOptions[P] };

type CustomEventMap = {
  click_template_question: GaEvent<
  'questionId' |
  'questionTitle'
  >;

  create_question: GaEvent<
  'questionId' |
  'questionHitCache' |
  'questionTitle' |
  'spent'
  >;

  create_question_failed: GaEvent<
  'errorMessage' |
  'spent'
  >;

  explore_question: GaEvent<
  'questionId' |
  'questionTitle' |
  'questionHitCache' |
  'questionRecommended' |
  'questionStatus' |
  'questionNotClear' |
  'questionHasAssumption' |
  'questionSqlCanAnswer' |
  'spent'
  >;

  login_fail: GaEvent<'trigger_login_by'>;
  login_success: GaEvent<'trigger_login_by'>;
  trigger_login: GaEvent<'trigger_login_by'>;
};

interface GtagEventApi {
  gtagEvent: (<T extends keyof CustomEventMap>(name: CustomEventMap[T] extends void ? never : T, props: CustomEventMap[T]) => void) & (<T extends keyof CustomEventMap>(name: CustomEventMap[T] extends void ? T : never) => void);
}

export function useGtag (): GtagEventApi {
  const { siteConfig } = useDocusaurusContext();

  return {
    gtagEvent: useMemoizedFn(<T extends keyof CustomEventMap> (name: T, props?: CustomEventMap[T]) => {
      gtag('event', name, {
        ...props,
        send_to: siteConfig.customFields?.ga_measure_id,
      });
    }) as GtagEventApi['gtagEvent'],
  };
}
