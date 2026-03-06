import * as React from 'react';
import { EditorContainer, EditorExtra } from '@/dynamic-pages/analyze/playground/styled';
import { ReactNode } from 'react';
import Loading from '@/components/Loading';
import { IAceOptions } from 'react-ace';

const SQLEditor = (props: {
  placeholder?: string;
  mode: string;
  theme: string;
  name: string;
  onChange: (newValue: string) => void;
  value: string;
  fontSize?: number;
  showPrintMargin?: boolean;
  showGutter?: boolean;
  highlightActiveLine?: boolean;
  loading?: boolean;
  setOptions?: IAceOptions;
  extra?: ReactNode;
}) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const AceEditor = require('react-ace').default;
  require('ace-builds/src-noconflict/mode-sql');
  require('ace-builds/src-noconflict/theme-twilight');
  require('ace-builds/src-noconflict/ext-language_tools');

  return (
    <EditorContainer>
      <Loading loading={props.loading} />
      <AceEditor
        placeholder={props.placeholder}
        mode={props.mode}
        theme={props.theme}
        name={props.name}
        // onLoad={props.onLoad}
        onChange={props.onChange}
        // onSelectionChange={this.onSelectionChange}
        // onCursorChange={this.onCursorChange}
        // onValidate={this.onValidate}
        value={props.value}
        fontSize={props.fontSize}
        showPrintMargin={props.showPrintMargin}
        showGutter={props.showGutter}
        highlightActiveLine={props.highlightActiveLine}
        width="100%"
        height="100%"
        setOptions={props.setOptions}
      />
      <EditorExtra>
        {props.extra}
      </EditorExtra>
    </EditorContainer>
  );
};

export default SQLEditor;
