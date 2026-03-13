import type { WidgetVisualizerContext } from '@/lib/charts-types';
import { CardHeading } from '@/lib/charts-core/renderer/react/builtin/CardHeading';
import { LabelValue } from '@/lib/charts-core/renderer/react/builtin/LabelValue';
import { AvatarLabel } from '@/lib/charts-core/renderer/react/builtin/AvatarLabel';
import { AvatarProgress } from '@/lib/charts-core/renderer/react/builtin/AvatarProgress';
import { Label } from '@/lib/charts-core/renderer/react/builtin/Label';

type Params = {
  owner_id: string;
  period?: string;
};

type DataPoint = {
  repo_id: number;
  repo_name: string;
  additions: number;
  deletions: number;
  changes: number;
};

type Input = [DataPoint[], DataPoint[] | undefined];

export const type = 'react';

export default function Card({ data, ctx, linkedData }: { data: any[]; ctx: any; linkedData: any }) {
  const [inputData] = data as unknown as Input;

  const processedData = inputData.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <CardHeading
        title="Which Repositories Have the Most Frequent Code Changes?"
        subtitle=" "
        colorScheme="dark"
        style={{ height: 48, flexShrink: 0, padding: '0 24px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 24px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <LabelValue
            label="Repo"
            labelProps={{
              style: {
                fontSize: 12,
                fontWeight: 'normal',
                marginRight: 'auto',
              },
            }}
            colorScheme="dark"
            style={{ flex: 0.3 }}
          />
          <LabelValue
            label="Lines of Code Changed"
            labelProps={{
              style: {
                fontSize: 12,
                fontWeight: 'normal',
              },
            }}
            colorScheme="dark"
            style={{ flex: 0.3 }}
          />
          <LabelValue
            label=""
            colorScheme="dark"
            style={{ flex: 0.2 }}
          />
          <LabelValue
            label="Add/Delete"
            labelProps={{
              style: {
                fontSize: 12,
                fontWeight: 'normal',
              },
            }}
            colorScheme="dark"
            style={{ flex: 0.2 }}
          />
        </div>
        {processedData && processedData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {processedData.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                <AvatarLabel
                  label={item.repo_name.split('/')[1]}
                  imgSrc={`https://github.com/${item.repo_name.split('/')[0]}.png`}
                  imgSize={24}
                  href={`/analyze/${item.repo_name}`}
                  colorScheme="dark"
                  style={{ flex: 0.3 }}
                />
                <Label
                  label={item.changes}
                  labelProps={{
                    style: {
                      fontSize: 12,
                      fontWeight: 'normal',
                    },
                  }}
                  colorScheme="dark"
                  style={{ flex: 0.3 }}
                />
                <AvatarProgress
                  label={`+${item.additions}`}
                  value={item.additions}
                  valueFormatter={() => `-${item.deletions}`}
                  maxVal={item.additions + item.deletions}
                  color={ctx.theme.colors.green['400']}
                  backgroundColor={ctx.theme.colors.red['400']}
                  colorScheme="dark"
                  style={{ flex: 0.4 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
