import Svg, { Polyline } from 'react-native-svg';

type Props = {
  data: number[];
  width: number;
  height: number;
  colorUp: string;
  colorDown: string;
};

export function Sparkline({ data, width, height, colorUp, colorDown }: Props) {
  if (data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data
    .map((value, i) => {
      const x = padding + (i / (data.length - 1)) * innerW;
      const y = padding + innerH - ((value - min) / range) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  const color = data[data.length - 1] >= data[0] ? colorUp : colorDown;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
