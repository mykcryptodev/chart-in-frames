export const getChartOptions = (tokenName: string, ohlc: [number, number, number, number, number, number][], pool: any, chain: string) => {
  return {
    series: [{
      name: tokenName,
      data: ohlc.map(([x, o, h, l, c]) => ({ x: new Date(x * 1000), y:[o, c, l, h] })).reverse()
    }],
    chart: {
      type: "area",
      height: '100%',
      width: '100%',
      zoom: {
        enabled: true,
        type: 'x', // Can be 'x', 'y' or 'xy'
      },
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      // enabled: true,
      // when hovered, show the date and the price
      x: {
        show: false,
        // format: 'dd MMM yyyy',
      },
      marker: {
        show: false,
      },
      y: {
        formatter: (value: number) => {
          return `$${(value).toLocaleString([], {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}`;
        },
        title: {
          formatter: () => "",
        }
      },
    },
    grid:{
      yaxis:{
        lines:{
          show: false
        }
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        // type: 'horizontal',
        gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
        colorStops: []
      }
    },
    title: {
      text: pool.attributes.name,
      align: 'left'
    },
    subtitle: {
      text: // uppercase the first letter of the chain
        `${chain.charAt(0).toUpperCase() + chain.slice(1)} • ${pool.attributes.price_change_percentage.h24}% 24h price +/- • ${Number(pool.attributes.reserve_in_usd).toLocaleString([], { style: 'currency', currency: 'usd' })} Liquidity • ${Number(pool.attributes.volume_usd.h24).toLocaleString([], { style: 'currency', currency: 'usd' })} 24h volume • ${Number(pool.attributes.market_cap_usd).toLocaleString([], { style: 'currency', currency: 'usd' })} Marketcap`,
      align: 'left'
    },
    xaxis: {
      type: 'datetime',
      min: ohlc.length ? new Date(Date.now() - (ohlc.length * 24 * 60 * 60 * 1000)).getTime() : undefined,
      max: ohlc.length ? new Date((ohlc[0]?.[0] ?? 0) * 1000).getTime() : undefined,
    },
    yaxis: {
      opposite: true,
      labels: {
        show: true,
        formatter: (value: number) => {
          return `$${(value).toLocaleString([], {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}`;
        }
      },
    },
  }
}