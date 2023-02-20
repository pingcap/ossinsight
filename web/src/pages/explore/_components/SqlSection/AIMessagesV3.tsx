import { AIMessagesV2Props, joinComma } from '@site/src/pages/explore/_components/SqlSection/AIMessagesV2';
import React, { createContext, createElement, ReactElement, useEffect, useRef, useState } from 'react';
import { Pace, WindupChildren } from 'windups';
import { Question } from '@site/src/api/explorer';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Collapse, IconButton, styled } from '@mui/material';
import { isNullish, nonEmptyArray, notFalsy } from '@site/src/utils/value';
import { Line } from '@site/src/pages/explore/_components/SqlSection/styled';
import CopyButton from '@site/src/pages/explore/_components/SqlSection/CopyButton';
import { ExpandMore } from '@mui/icons-material';
import { useSafeSetTimeout } from '@site/src/hooks/mounted';

export interface AIMessagesV3Props extends AIMessagesV2Props {

}

export default function AIMessagesV3 ({ question, onStart, collapsed, onCollapsedChange, onStop, prompts }: AIMessagesV3Props) {
  const [, setVersion] = useState(0);
  const setTimeout = useSafeSetTimeout();

  const modelRef = useRef<QuestionModel>();

  useEffect(() => {
  }, []);

  useEffect(() => {
    const qid = question.id;
    onStart?.();
    onCollapsedChange?.(false);
    const model = modelRef.current = new QuestionModel(question, () => setVersion(v => v + 1));
    model.finishedHandlers.push(onStop ?? (() => {}));
    model.finishedHandlers.push(() => {
      setTimeout(() => {
        if (qid === question.id) {
          onCollapsedChange?.(true);
        }
      }, 3600);
    });
  }, [question.id]);

  useEffect(() => {
    modelRef.current?.accept(question);
  }, [question]);

  return (
    <ChatWrapper>
      <Collapse in={!collapsed}>
        {modelRef.current?.collapsableChildren}
      </Collapse>
      <CollapsedContext.Provider value={{ collapsed, onCollapsedChange }}>
        {modelRef.current?.children}
      </CollapsedContext.Provider>
      <Line>
        {prompts}
      </Line>
    </ChatWrapper>
  );
}

const enum QuestionModelStage {
  init,
  rq,
  keywords,
  links,
  sub,
  assumption,
  cq,
  finished,
}

const CollapsedContext = createContext({
  collapsed: undefined as boolean | undefined,
  onCollapsedChange: undefined as ((value: boolean) => void) | undefined,
});

class QuestionModel {
  private typing = false;
  private stage = QuestionModelStage.init;
  children: ReactElement[] = [];
  collapsableChildren: ReactElement[] = [];
  finishedHandlers: Array<() => void> = [];

  constructor (private question: Question, private readonly update: () => void) {
  }

  private next () {
    this.typing = false;

    if (this.stage === QuestionModelStage.finished) {
      this.finishedHandlers.forEach(cb => cb());
      return;
    }

    this.stage = this.stage + 1;
    this.accept(this.question);
  }

  private startTyping () {
    this.typing = true;
    this.update();
  }

  private renderRevisedTitle (rq: string) {
    return (
      <Line key="rq">
        <WindupChildren onFinished={() => this.next()}>
          {'You seem curious about: '}
          <span className="rq">
            {rq}
          </span>
        </WindupChildren>
      </Line>
    );
  }

  private renderKeywords (keywords: string[]) {
    return (
      <Line key="keywords">
        <WindupChildren onFinished={() => this.next()}>
          {'Extracting key words: '}
          {joinComma(keywords.map(keyword => (
            <strong key={keyword}>{keyword}</strong>
          )))}
        </WindupChildren>
      </Line>
    );
  }

  private renderLinks (links: string[]) {
    return (
      <Line key="links">
        <WindupChildren onFinished={() => this.next()}>
          {'Might be the key player: '}
          {joinComma(links.map(link => (
            <a key={link} href={link} target="_blank" rel="noreferrer">{link}</a>
          )))}
        </WindupChildren>
      </Line>
    );
  }

  private renderSubQuestions (subQuestions: string[]) {
    return (
      <Line key="subQuestions">
        <WindupChildren onFinished={() => this.next()}>
          <p>Thinking about the details...</p>
          <ul>
            {subQuestions.map((question, index) => (
              <Pace key={index} ms={50}>
                <li>{question}</li>
              </Pace>
            ))}
          </ul>
        </WindupChildren>
      </Line>
    );
  }

  private renderAssumption (assumption: string) {
    return (
      <Line key="assumption">
        <WindupChildren onFinished={() => this.next()}>
          {'I suppose: '}
          <span className="assumption">
            {assumption}
          </span>
        </WindupChildren>
      </Line>
    );
  }

  private renderCombinedTitle (combinedTitle: string) {
    return (
      <Line key="cq">
        <WindupChildren onFinished={() => this.next()}>
          {'And your question becomes: '}
          <span className="cq">{parseHtmlString(combinedTitle)}</span>
          <CopyButton content={combinedTitle} />
        </WindupChildren>
        <CollapsedContext.Consumer>
          {({ collapsed, onCollapsedChange }) => (
            <IconButton disabled={isNullish(collapsed)} size="small" onClick={() => onCollapsedChange?.(!collapsed)}>
              <ExpandMore sx={{ rotate: notFalsy(collapsed) ? 0 : '180deg', transition: theme => theme.transitions.create('rotate') }} />
            </IconButton>
          )}
        </CollapsedContext.Consumer>
      </Line>
    );
  }

  private renderMessage () {
    return (
      <Line className="message light">
        <WindupChildren onFinished={() => this.next()}>
          You can copy and revise it based on the question above 👆.
        </WindupChildren>
      </Line>
    );
  }

  private run<T> (get: (question: Question) => T, validate: (value: T) => boolean, renderer: (value: NonNullable<T>) => ReactElement, collapsable = false) {
    console.log('run', this.stage);
    const value = get(this.question);
    if (validate(value)) {
      (collapsable ? this.collapsableChildren : this.children).push(renderer.call(this, value));
      this.startTyping();
    } else {
      this.next();
    }
  }

  accept (question: Question) {
    this.question = question;
    if (this.typing) {
      return;
    }
    switch (this.stage) {
      case QuestionModelStage.init:
        this.run(q => q.answer?.revisedTitle ?? q.revisedTitle, notNone, this.renderRevisedTitle, true);
        break;
      case QuestionModelStage.rq:
        this.run(q => parseKeywords(q.answer?.keywords), nonEmptyArray, this.renderKeywords, true);
        break;
      case QuestionModelStage.keywords:
        this.run(q => parseKeywords(q.answer?.links), nonEmptyArray, this.renderLinks, true);
        break;
      case QuestionModelStage.links:
        this.run(q => q.answer?.subQuestions, nonEmptyArray, this.renderSubQuestions, true);
        break;
      case QuestionModelStage.sub:
        this.run(q => q.answer?.assumption ?? q.assumption, notNone, this.renderAssumption, true);
        break;
      case QuestionModelStage.assumption:
        this.run(q => q.answer?.combinedTitle ?? q.combinedTitle, notNone, this.renderCombinedTitle);
        break;
      case QuestionModelStage.cq:
        this.run(() => undefined, () => true, this.renderMessage);
        break;
      case QuestionModelStage.finished:
        this.next();
        break;
    }
  }
}

export function parseKeywords (keywords: string[] | string | null | undefined): string[] {
  if (isNullish(keywords)) {
    return [];
  } else if (typeof keywords === 'string') {
    return keywords.split(',').map(s => s.trim()).filter(s => notNone(s));
  } else {
    return keywords;
  }
}

const ChatWrapper = styled('div')`
  font-weight: normal;

  .rq {
    font-weight: bold;
    color: #ECBAAA;
  }

  .assumption {
    font-weight: bold;
    color: #F4EFDA;
  }

  .cq {
    display: inline;
    font-weight: bold;
    color: #BDDBFF;
    border-radius: 6px;
    border: 1px dashed #656565;
    padding: 6px;
    line-height: 1.25;
    pointer-events: auto;
    user-select: text !important;
    cursor: text;


    > i, b {
      background-color: #6B40B1;
    }
  }
`;

function parseHtmlString (text: string): Array<ReactElement | string> {
  if (typeof document === 'undefined') {
    return [text];
  }
  const temp = document.createElement('div');
  temp.innerHTML = text;
  const res: Array<ReactElement | string> = [];

  temp.childNodes.forEach((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) {
      res.push(node.textContent ?? '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      res.push(createElement((node as HTMLElement).tagName.toLowerCase(), { key: i }, node.textContent));
    }
  });

  return res;
}
