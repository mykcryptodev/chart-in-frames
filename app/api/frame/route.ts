import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getChartOptions } from '../lib/getChartOptions';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let text: string | undefined = '';
  let ohlcsv: [number, number, number, number, number, number][] = [];

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0] ?? message.interactor.custody_address;
  }

  if (message?.input) {
    text = message.input;
    const poolRes = await fetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${text}&page=1`);
    const poolJson = await poolRes.json();
    const poolData = poolJson.data;
    // the pool is the poolData with highest attributes.reserve_in_usd value (most liquidity)
    const pool = poolData.reduce((prev: any, current: any) => {
      return Number(prev.attributes.reserve_in_usd) > Number(current.attributes.reserve_in_usd) ? prev : current;
    }, { attributes: { reserve_in_usd: '0' },
    });
    const { attributes, id } = pool;
    const poolAddress = attributes.address;
    // the chain is the word before "_0x" in the id
    const chain = id.split('_0x')[0];
    // get the chart data
    const ohlcvRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/${chain}/pools/${poolAddress}/ohlcv/day`);
    const ohlcvJson = await ohlcvRes.json();
    ohlcsv = ohlcvJson.data.attributes.ohlcv_list;
  }

  const chartOptions = getChartOptions(text, ohlcsv);
  console.log(`https://quickchart.io/apex-charts/render?config=${JSON.stringify(chartOptions)}`);

  if (message?.button === 3) {
    return NextResponse.redirect(
      'https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms',
      { status: 302 },
    );
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Something: ${text} 🌲🌈`,
        },
      ],
      input: {
        text: "Ya gotta say it",
      },
      image: {
        // src: `${NEXT_PUBLIC_URL}/park-1.png`,
        src: `https://quickchart.io/apex-charts/render?config=${JSON.stringify(chartOptions)}`,
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
