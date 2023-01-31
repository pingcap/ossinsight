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
};

export function useGtag () {
  const { siteConfig } = useDocusaurusContext();

  const event = useMemoizedFn(<T extends keyof CustomEventMap> (name: T, props: CustomEventMap[T]) => {
    gtag('event', name, {
      ...props,
      send_to: siteConfig.customFields?.ga_measure_id,
    });
  });

  return {
    gtagEvent: event,
  };
}
