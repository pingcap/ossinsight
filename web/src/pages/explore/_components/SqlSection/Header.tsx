import AIMessages from '@site/src/pages/explore/_components/SqlSection/AIMessages';
import { Line, StyledTitle } from '@site/src/pages/explore/_components/SqlSection/styled';
import React, { useMemo, useRef, useState } from 'react';
import useQuestionManagement, { GENERATE_SQL_NON_FINAL_PHASES, QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { notNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { SectionStatus, SectionStatusIcon } from '@site/src/pages/explore/_components/Section';
import { Button } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useInterval } from 'ahooks';
import { randomOf } from '@site/src/utils/generate';
import TypewriterEffect from '@site/src/pages/explore/_components/TypewriterEffect';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';

export interface HeaderProps {
  sqlSectionStatus: SectionStatus;
  open: boolean;
  toggleOpen: () => void;
  onMessagesStart?: () => void;
  onMessagesReady?: () => void;
}

export default function Header ({ sqlSectionStatus, open, toggleOpen, onMessagesStart, onMessagesReady }: HeaderProps) {
  const { question, phase } = useQuestionManagement();

  const sqlTitle = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return '';
      case QuestionLoadingPhase.LOADING:
        return 'Loading question...';
      case QuestionLoadingPhase.CREATING:
      case QuestionLoadingPhase.GENERATING_SQL:
        return <GeneratingSqlPrompts />;
      case QuestionLoadingPhase.LOAD_FAILED:
        return 'Question not found';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'Failed to generate SQL';
      default:
        return 'Ta-da! SQL is written,';
    }
  }, [phase]);

  const hasPrompt = useMemo(() => {
    return notNullish(question) && (
      notNone(question.revisedTitle) ||
      notNone(question.combinedTitle) ||
      notNone(question.notClear) ||
      notNone(question.assumption)
    );
  }, [question]);

  const isFinalPhase = useMemo(() => {
    return !GENERATE_SQL_NON_FINAL_PHASES.has(phase);
  }, [phase]);

  const titleLine = (
    <>
      <SectionStatusIcon status={sqlSectionStatus} />
      {sqlTitle}
      {sqlSectionStatus === 'success' && (
        <Button size="small" onClick={toggleOpen} endIcon={<ExpandMore sx={{ rotate: open ? '180deg' : 0, transition: theme => theme.transitions.create('rotate') }} />} sx={{ ml: 1 }}>
          {open ? 'Hide' : 'Check it out'}
        </Button>
      )}
    </>
  );

  return (
    <StyledTitle>
      {hasPrompt
        ? (
          <AIMessages
            question={question}
            hasPrompt={hasPrompt}
            titleLine={titleLine}
            onStart={onMessagesStart}
            onReady={onMessagesReady}
          />
          )
        : <>
          {!isFinalPhase && (
            <Line>
              <BotIcon animated sx={{ mr: 1, mt: 0.5 }} />
              {sqlTitle}
            </Line>
          )}
          {isFinalPhase && (
            <Line>{titleLine}</Line>
          )}
        </>
      }
    </StyledTitle>
  );
}

const generatingSQLPrompts: string[][] = [
  ['Great question!', 'Interesting question!', 'Awesome question!', 'You asked a winner!'],
  ['Sometimes I\'m not smart enough...', 'Sometimes it\'s difficult for me...', 'Not always generate perfect SQL...', 'Struggling with SQL accuracy...'],
  ['Tough, but still trying...', 'Hard, but persevering.', 'Tough, but forging ahead...', 'Challenging, but still striving...', 'Struggling, but pushing on...'],
  ['Mastering the art of turning words into SQL magic…', 'Gaining knowledge from your input...', 'Learning from your question...', 'Getting smarter with your input...'],
  ['Making every effort!', 'Working my hardest', 'Trying my best...', 'Striving for greatness...', 'Trying my best...'],
  ['Almost there…', 'Almost done...', 'Just a second!'],
];

function GeneratingSqlPrompts () {
  const idx = useRef({ group: 0 });
  const [current, setCurrent] = useState(() => randomOf(generatingSQLPrompts[0]));

  useInterval(() => {
    let { group } = idx.current;
    if (group < 5) {
      group += 1;
    } else {
      group = 4;
    }
    setCurrent(randomOf(generatingSQLPrompts[group]));
    idx.current.group = group;
  }, 3000);

  if (notNullish(current)) {
    return <TypewriterEffect content={current} />;
  } else {
    return <>Generating SQL...</>;
  }
}
