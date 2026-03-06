import { WidgetTitle } from '@/components/Widget/Title';
import { toWidgetPathname } from '@/components/Widget/utils';
import { widgetParameterDefinitions } from '@/utils/widgets';
import ArrowUpRightIcon from 'bootstrap-icons/icons/arrow-up-right.svg';

import Image from 'next/image';
import { Suspense } from 'react';

export async function WidgetPreview ({ name }: { name: string }) {
  const imageUsp = new URLSearchParams(await dynamicParameters(name));

  imageUsp.set('image_size', 'preview_image');

  return (
    <div className="group rounded-md relative overflow-hidden bg-popover border w-full transition-shadow hover:shadow-lg">
      <div className="flex flex-col items-center bg-body p-4 gap-4 md:h-[360px]">
        <h2 className="text-lg font-bold text-title">
          <Suspense fallback="&nbsp;">
            <WidgetTitle widget={name} />
          </Suspense>
        </h2>
        <div className="flex-1 flex items-center">
          <Image
            className="block"
            loading="lazy"
            width={480}
            height={270}
            quality={100}
            src={`${toWidgetPathname(name)}/thumbnail.png?${imageUsp.toString()}`}
            alt="preview"
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-10 flex items-center justify-center gap-2 transition-transform transform-gpu translate-y-full group-hover:translate-y-0 text-black bg-primary">
        Get this widget
        <ArrowUpRightIcon />
      </div>
    </div>
  );
}

export async function dynamicParameters (name: string) {
  const params = await widgetParameterDefinitions(name);
  const usp = Object.entries(params).reduce((usp, [key, config]) => {
    if (config.default != null) {
      usp.set(key, String(config.default));
    }
    return usp;
  }, new URLSearchParams());
  return usp.toString();
}


