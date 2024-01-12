import React, { ReactNode } from 'react';
import Section, { SubSection } from '../_components/Section';
import Keynote, { KeynoteProps } from '../_components/Keynote';
import { IssueOpenedIcon, RepoForkedIcon, StarIcon } from '@primer/octicons-react';
import colors from '../_components/colors.module.css';
import Split from '../_components/Split';
import { H2 } from '../_components/typograph';

import { styled, Box } from '@mui/material';

export default function () {
  return (
    <Section>
      <SubSection
        additional='Appendix'
        title='Term Description'
        titleComponent={H2}
      >
        <Box mt={4}>
          <Split>
            {keynotes.map((keynote, i) => (
              <Keynote key={i} {...keynote} />
            ))}
          </Split>
        </Box>
      </SubSection>
      <SubSection
        title={tableTitle}
        description={tableDescription}
        descriptionProps={{
          maxWidth: 1165,
        }}
      >
        <Table>
          <thead>
          <tr>
            <th>Topic</th>
            <th>Exact matching</th>
            <th>Fuzzy matching</th>
          </tr>
          </thead>
          <tbody>
          {tableContent.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td>{row.matched}</td>
              <td style={{ whiteSpace: 'pre-wrap' }}>{row.fuzzy}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      </SubSection>
    </Section>
  );
}

const keynotes: KeynoteProps[] = [
  {
    icon: <IssueOpenedIcon size={24} className={colors.blue} />,
    title: 'About GitHub events',
    description: 'GitHub events are triggered by user actions, like starring a repository or pushing code.',
  },
  {
    icon: <RepoForkedIcon size={24} className={colors.orange} />,
    title: 'About time range',
    description: 'In this report, the data collection range of 2022 is from January 1, 2022 to September 30, 2022. When comparing data of 2022 with another year, we use year-on-year analysis.',
  },
  {
    icon: <StarIcon size={24} className={colors.green} />,
    title: 'About bot events',
    description: 'Bot-triggered events account for a growing percentage of GitHub events. However, these events are not the focus of this report. We filtered out most of the bot-initiated events by matching regular expressions.',
  },
];

const tableTitle = 'How we classify technical fields by topics';
const tableDescription = 'We do exact matching and fuzzy matching based on the repository topic. Exact matching means that the repository topics have a topic that exactly matches the word, and fuzzy matching means that the repository topics have a topic that contains the word.';

const tableContent: Array<{
  name: string;
  matched?: ReactNode;
  fuzzy?: ReactNode;
}> = [
  {
    name: 'GitHub Actions',
    matched: 'actions',
    fuzzy: 'github-action, gh-action',
  },
  {
    name: 'Low Code',
    fuzzy: 'low-code, lowcode, nocode, no-code',
  },
  {
    name: 'Web3',
    fuzzy: 'web3',
  },
  {
    name: 'Database',
    matched: 'db',
    fuzzy: (
      <>
        database, databases
        nosql, newsql, sql
        mongodb,neo4j
      </>
    ),
  },
  {
    name: 'AI',
    matched: 'ai, aiops, aiot',
    fuzzy: (
      <>
        artificial-intelligence, machine-intelligence
        computer-vision, image-processing, opencv, computervision, imageprocessing
        voice-recognition, speech-recognition, voicerecognition, speechrecognition, speech-processing
        machinelearning, machine-learning
        deeplearning, deep-learning
        transferlearning, transfer-learning
        mlops
        text-to-speech, tts, speech-synthesis, voice-synthesis
        robot, robotics
        sentiment-analysis
        natural-language-processing, nlp
        language-model, text-classification, question-answering, knowledge-graph, knowledge-base
        gan, gans, generative-adversarial-network, generative-adversarial-networks
        neural-network, neuralnetwork, neuralnetworks, neural-network, dnn
        tensorflow
        PyTorch
        huggingface
        transformers
        seq2seq, sequence-to-sequence
        data-analysis, data-science
        object-detection, objectdetection
        data-augmentation
        classification
        action-recognition
      </>
    ),
  },
];

const Table = styled('table')({
  display: 'table',
  width: '100%',
  fontSize: '0.8em',
  marginTop: 24,
});
