import React from "react";
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
        <tr>
          <th>Copilot</th>
          <td>copilot, github-copilot</td>
          <td />
        </tr>
        <tr>
          <th>Action</th>
          <td>actions</td>
          <td />
        </tr>
        <tr>
          <th>Low Code</th>
          <td />
          <td>low-code, lowcode, nocode, no-code</td>
        </tr>
        <tr>
          <th>Web3</th>
          <td />
          <td>web3</td>
        </tr>
        <tr>
          <th rowSpan={3}>Database</th>
          <td rowSpan={3}>db</td>
          <td>database, databases</td>
        </tr>
        <tr>
          <td>nosql, newsql, sql</td>
        </tr>
        <tr>
          <td>mongodb,neo4j</td>
        </tr>
        <tr>
          <th rowSpan={9999}>AI</th>
          <td rowSpan={6}>ai</td>
          <td>artificial-intelligence, machine-intelligence</td>
        </tr>
        <tr>
          <td>computer-vision, image-processing, opencv, computervision, imageprocessing</td>
        </tr>
        <tr>
          <td>voice-recognition, speech-recognition, voicerecognition, speechrecognition, speech-processing</td>
        </tr>
        <tr>
          <td>machinelearning, machine-learning</td>
        </tr>
        <tr>
          <td>deeplearning, deep-learning</td>
        </tr>
        <tr>
          <td>transferlearning, transfer-learning</td>
        </tr>
        <tr>
          <td rowSpan={4}>aiops</td>
          <td>mlops</td>
        </tr>
        <tr>
          <td>text-to-speech, tts, speech-synthesis, voice-synthesis</td>
        </tr>
        <tr>
          <td>robot, robotics</td>
        </tr>
        <tr>
          <td>sentiment-analysis</td>
        </tr>
        <tr>
          <td rowSpan={15}>aiot</td>
        </tr>
        <tr>
          <td>natural-language-processing, nlp</td>
        </tr>
        <tr>
          <td>language-model, text-classification, question-answering, knowledge-graph, knowledge-base</td>
        </tr>
        <tr>
          <td>gan, gans, generative-adversarial-network, generative-adversarial-networks</td>
        </tr>
        <tr>
          <td>neural-network, neuralnetwork, neuralnetworks, neural-network, dnn</td>
        </tr>
        <tr>
          <td>tensorflow</td>
        </tr>
        <tr>
          <td>PyTorch</td>
        </tr>
        <tr>
          <td>huggingface</td>
        </tr>
        <tr>
          <td>transformers</td>
        </tr>
        <tr>
          <td>seq2seq, sequence-to-sequence</td>
        </tr>
        <tr>
          <td>data-analysis, data-science</td>
        </tr>
        <tr>
          <td>object-detection, objectdetection</td>
        </tr>
        <tr>
          <td>data-augmentation</td>
        </tr>
        <tr>
          <td>classification</td>
        </tr>
        <tr>
          <td>action-recognition</td>
        </tr>
        </tbody>
      </Table>
    </Section>
  );
}

const title = 'How we classify technical fields by topics';
const description = 'We do exact matching and fuzzy matching based on the repository topic. Exact matching means that the repository topics have a topic that exactly matches the word, and fuzzy matching means that the repository topics have a topic that contains the word.';

const Table = styled('table')({
  display: 'table',
  width: '100%',
  fontFamily: 'JetBrains Mono',
  fontSize: 14,
  marginTop: 24,
});
