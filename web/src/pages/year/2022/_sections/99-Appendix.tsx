import React, { ReactNode } from "react";
import Section from "../_components/Section";
import { styled } from "@mui/material/styles";

export default function () {
  return (
    <Section
      title={title}
      description={description}
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
    </Section>
  );
}

const title = 'How we classify technical fields by topics';
const description = 'We do exact matching and fuzzy matching based on the repository topic. Exact matching means that the repository topics have a topic that exactly matches the word, and fuzzy matching means that the repository topics have a topic that contains the word.';

const tableContent: {
  name: string
  matched?: ReactNode
  fuzzy?: ReactNode
}[] = [
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
