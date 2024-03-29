import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { getChartOptions } from '../lib/getChartOptions';
import { throwErr } from '../lib/throwErr';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let text: string | undefined = '';
  let pool: any | undefined = {};
  let chain: string = '';
  let ohlcsv: [number, number, number, number, number, number][] = [];

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return throwErr('pls-enter.png');
  }

  try {
    if (message?.input) {
      text = message.input;
      const poolRes = await fetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${text}&page=1`);
      const poolJson = await poolRes.json();
      const poolData = poolJson.data;
      // the pool is the poolData with highest attributes.reserve_in_usd value (most liquidity)
      pool = poolData.reduce((prev: any, current: any) => {
        return Number(prev.attributes.reserve_in_usd) > Number(current.attributes.reserve_in_usd) ? prev : current;
      }, { attributes: { reserve_in_usd: '0' },
      });
      const { attributes, id } = pool;
      const poolAddress = attributes.address;
      // the chain is the word before "_0x" in the id
      chain = id.split('_0x')[0];
      // get the chart data
      const ohlcvRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/${chain}/pools/${poolAddress}/ohlcv/day`);
      const ohlcvJson = await ohlcvRes.json();
      ohlcsv = ohlcvJson.data.attributes.ohlcv_list;
    } else {
      return throwErr('pls-enter.png');
    }
  
    const chartOptions = getChartOptions(text, ohlcsv, pool, chain);
    const chartRes = await fetch(`https://quickchart.io/apex-charts/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: chartOptions,
        height: 400,
        width: 800,
      }),
    });
    const chartBlob = await chartRes.blob();
    const chartBuffer = await chartBlob.arrayBuffer(); // Convert the Blob to an ArrayBuffer
    const chartBase64 = Buffer.from(chartBuffer).toString('base64'); // Convert the ArrayBuffer to a Base64 string
  
    if (message?.button === 2) {
      return NextResponse.redirect(
        `https://www.coingecko.com/en/coins/${text}`,
        { status: 302 },
      );
    }
  
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Load new chart`,
          },
          {
            action: 'link',
            label: 'View on Coingecko',
            target: `https://www.coingecko.com/en/coins/${text}`,
          },
        ],
        input: {
          text: "Enter new token!",
        },
        image: {
          src: `data:image/png;base64,${chartBase64}`,
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      }),
    );
  } catch (e) {
    return throwErr('not-found.png');
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
