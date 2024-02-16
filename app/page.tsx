import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Load chart!',
    },
    {
      action: 'link',
      label: 'Ty, Coingecko!',
      target: 'https://www.coingecko.com',
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/poster-w-squiggle.png`,
    aspectRatio: '1:1',
  },
  input: {
    text: 'Enter a token name to view chart',
  },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'zizzamia.xyz',
  description: 'LFG',
  openGraph: {
    title: 'zizzamia.xyz',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/poster-w-squiggle.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>zizzamia.xyz</h1>
    </>
  );
}
