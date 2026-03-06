import async from "async";
import {DateTime, Duration} from "luxon";
import {Logger} from "pino";

export async function processInBatch<T>(tasks: T[], concurrent: number, action: (task: T) => void) {
  const queue = async.queue<T>(async (task) => {
    await action(task);
  }, concurrent);

  for (const task of tasks) {
    void queue.push(task);
  }

  await queue.drain();
}

export type NodeSearcher<R> = (left: DateTime, right: DateTime) => Promise<[boolean, R[]]>;
export type NodeSaver = (nodes: any[]) => Promise<void>;

export const LESS_THAN_100_CNT_THRESHOLD = 3;
export const LESS_THAN_100_CNT_LEFT_BOUND = 0;
export const LESS_THAN_100_CNT_RIGHT_BOUND = 3;

export const MORE_THAN_1K_CNT_THRESHOLD = 3;
export const MORE_THAN_1K_CNT_LEFT_BOUND = 0;
export const MORE_THAN_1K_CNT_RIGHT_BOUND = 3;

export async function syncNodesInTimeRanges<R>(
  logger: Logger, tFrom: DateTime, tTo: DateTime, initialStepSize: Duration,
  fetcher: NodeSearcher<R>, saver: NodeSaver,
): Promise<void> {
  // Init the first time range.
  let stepSize = initialStepSize;
  let left = DateTime.fromJSDate(tFrom.toJSDate());
  let right = left.plus(stepSize);
  let interval = right.diff(left, 'seconds').seconds;
  let lessThan100Cnt = 0;
  let moreThan1kCnt = 0;

  while (interval > 0) {
    const [moreThan1k, nodes] = await fetcher(left, right);

    // Reduce the time range if the number of nodes is more than 1000.
    if (moreThan1k) {
      if (interval <= 1) {
        logger.warn(`The time range cannot be reduced further (less than 1s), data after the 1000th node may be lost.`);
      } else {
        interval = Math.max(1, interval / 2);
        right = left.plus({
          seconds: interval
        });
      }

      // Auto reduce the step size to avoid more than 1k nodes problem.
      if (moreThan1k) {
        moreThan1kCnt = Math.min(MORE_THAN_1K_CNT_RIGHT_BOUND, moreThan1kCnt + 1);
      } else {
        moreThan1kCnt = Math.max(MORE_THAN_1K_CNT_LEFT_BOUND, moreThan1kCnt - 1);
      }
      if (moreThan1kCnt >= MORE_THAN_1K_CNT_THRESHOLD) {
        const newStepSize = Math.round(stepSize.as('seconds') / 2);
        stepSize = Duration.fromObject({seconds: newStepSize});
        logger.info(`⚙️ Reduce the step size to ${stepSize.toHuman()}.`);
      }

      continue;
    }

    // Save the data to database.
    await saver(nodes);

    // Auto increase the step size to fetch as many nodes as possible in one request.
    if (nodes.length < 100) {
      lessThan100Cnt = Math.min(LESS_THAN_100_CNT_RIGHT_BOUND, lessThan100Cnt + 1);
    } else {
      lessThan100Cnt = Math.max(LESS_THAN_100_CNT_LEFT_BOUND, lessThan100Cnt - 1);
    }
    if (lessThan100Cnt >= LESS_THAN_100_CNT_THRESHOLD) {
      const newStepSize = Math.round(stepSize.as('seconds') * 2);
      stepSize = Duration.fromObject({seconds: newStepSize});
      logger.info(`⚙️ Increase the step size to ${stepSize.toHuman()}.`);
    }

    // For next loop.
    left = right
    right = right.plus(stepSize);
    interval = right.diff(left, 'seconds').seconds;
  }
}