import { useTheme } from '../store/theme';

interface LogoProps {
  /** Rendered height in pixels. Width scales proportionally (logo is 600×240, 2.5:1 ratio). */
  height?: number;
  className?: string;
}

export default function Logo({ height = 48, className }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  const width = Math.round(height * 2.5);

  return (
    <img
      src={src}
      alt="TheBoys"
      width={width}
      height={height}
      className={className}
      style={{ height, width }}
    />
  );
}
