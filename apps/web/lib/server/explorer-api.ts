import { executeExplorerRows } from '@/lib/explorer/query';

const DEFAULT_RECOMMEND_LIMIT = 10;
const MAX_RECOMMEND_LIMIT = 100;

export interface ExplorerTag {
  id: number;
  label: string;
  color: string | null;
  sort: number;
}

export interface ExplorerRecommendQuestionTag {
  id: number;
  label: string;
  color: string | null;
}

export interface ExplorerRecommendQuestion {
  hash: string;
  title: string;
  aiGenerated: boolean;
  questionId: string | null;
  tags: ExplorerRecommendQuestionTag[];
}

export async function listExplorerTags(signal?: AbortSignal): Promise<ExplorerTag[]> {
  const { rows } = await executeExplorerRows(
    `
      SELECT
        id,
        label,
        color,
        sort
      FROM explorer_question_tags
      ORDER BY sort, id
    `,
    null,
    signal,
  );

  return rows as ExplorerTag[];
}

export async function listRecommendedExplorerQuestions(
  options: {
    n?: number;
    aiGenerated?: boolean;
    tagId?: number | null;
  } = {},
  signal?: AbortSignal,
): Promise<ExplorerRecommendQuestion[]> {
  const limit = normalizeLimit(options.n);

  if (options.aiGenerated) {
    const { rows } = await executeExplorerRows(
      `
        SELECT
          hash,
          title,
          ai_generated AS aiGenerated,
          NULL AS questionId
        FROM explorer_recommend_questions
        WHERE ai_generated = 1
        ORDER BY RAND()
        LIMIT ${limit}
      `,
      null,
      signal,
    );

    return rows.map((row) => ({
      hash: String(row.hash),
      title: String(row.title),
      aiGenerated: Boolean(row.aiGenerated),
      questionId: row.questionId ? String(row.questionId) : null,
      tags: [],
    }));
  }

  const { rows } = await executeExplorerRows(
    options.tagId != null
      ? `
          SELECT
            eq.hash,
            eq.title,
            false AS aiGenerated,
            BIN_TO_UUID(eq.id) AS questionId
          FROM explorer_questions eq
          JOIN explorer_question_tag_rel eqtr ON eqtr.question_id = eq.id
          WHERE eq.recommended = 1
            AND eqtr.tag_id = :tagId
          ORDER BY RAND()
          LIMIT ${limit}
        `
      : `
          SELECT
            eq.hash,
            eq.title,
            false AS aiGenerated,
            BIN_TO_UUID(eq.id) AS questionId
          FROM explorer_questions eq
          WHERE eq.recommended = 1
          ORDER BY RAND()
          LIMIT ${limit}
        `,
    options.tagId != null ? { tagId: options.tagId } : null,
    signal,
  );

  const questions = rows.map((row) => ({
    hash: String(row.hash),
    title: String(row.title),
    aiGenerated: Boolean(row.aiGenerated),
    questionId: row.questionId ? String(row.questionId) : null,
  }));
  const tagsByQuestionId = await loadQuestionTagsByQuestionId(
    questions.map((question) => question.questionId).filter((value): value is string => Boolean(value)),
    signal,
  );

  return questions.map((question) => ({
    ...question,
    tags: question.questionId ? (tagsByQuestionId.get(question.questionId) ?? []) : [],
  }));
}

function normalizeLimit(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_RECOMMEND_LIMIT;
  }

  return Math.min(MAX_RECOMMEND_LIMIT, Math.max(1, Math.trunc(value as number)));
}

async function loadQuestionTagsByQuestionId(questionIds: string[], signal?: AbortSignal) {
  if (questionIds.length === 0) {
    return new Map<string, ExplorerRecommendQuestionTag[]>();
  }

  const queryArgs = Object.fromEntries(
    questionIds.map((questionId, index) => [`questionId${index}`, questionId]),
  );
  const placeholders = questionIds.map((_, index) => `UUID_TO_BIN(:questionId${index})`).join(', ');
  const { rows } = await executeExplorerRows(
    `
      SELECT
        BIN_TO_UUID(eqtr.question_id) AS questionId,
        eqt.id,
        eqt.label,
        eqt.color
      FROM explorer_question_tag_rel eqtr
      JOIN explorer_question_tags eqt ON eqt.id = eqtr.tag_id
      WHERE eqtr.question_id IN (${placeholders})
      ORDER BY eqt.sort, eqt.id
    `,
    queryArgs,
    signal,
  );

  return rows.reduce<Map<string, ExplorerRecommendQuestionTag[]>>((result, row) => {
    const questionId = String(row.questionId);
    const tags = result.get(questionId) ?? [];
    tags.push({
      id: Number(row.id),
      label: String(row.label),
      color: row.color == null ? null : String(row.color),
    });
    result.set(questionId, tags);
    return result;
  }, new Map());
}
