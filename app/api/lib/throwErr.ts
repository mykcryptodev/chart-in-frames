import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";

export const throwErr = (img: string) => {
  return new NextResponse(
    getFrameHtmlResponse({
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
        src: `${NEXT_PUBLIC_URL}/${img}`,
        aspectRatio: '1:1',
      },
      input: {
        text: 'Enter a token name to view chart',
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    })
  );
}