import * as dotenv from 'dotenv';
import * as path from 'path';

import { buildSendMail } from 'mailing-core';
import { createTransport } from 'nodemailer';

const postmarkTransport = require('nodemailer-postmark-transport');

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const transport = createTransport(
  postmarkTransport({
    auth: {
      apiKey: process.env.POSTMARK_API_KEY!,
    },
  }),
);

const sendMail = buildSendMail({
  transport,
  defaultFrom: 'ossinsight@pingcap.com',
  configPath: './mailing.config.json',
});

export default sendMail;
