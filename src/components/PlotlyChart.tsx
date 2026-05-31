import React, { useEffect, useRef } from 'react';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';

interface PlotlyChartProps {
  data: any[];
  layout: any;
  config?: any;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlotlyChart({ data, layout, config, className, style }: PlotlyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const currentContainer = containerRef.current;
    
    if (currentContainer) {
      const mergedConfig = {
        responsive: true,
        displayModeBar: false,
        ...config
      };
      
      const mergedLayout = {
        autosize: true,
        margin: { t: 40, r: 20, b: 40, l: 50 },
        font: { family: 'Inter, system-ui, sans-serif', size: 11 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        ...layout
      };

      Plotly.newPlot(currentContainer, data, mergedLayout, mergedConfig);

      // ResizeObserver to resize the canvas dynamically
      const resizeObserver = new ResizeObserver(() => {
        if (active && currentContainer) {
          Plotly.Plots.resize(currentContainer);
        }
      });
      resizeObserver.observe(currentContainer);

      return () => {
        active = false;
        resizeObserver.disconnect();
        Plotly.purge(currentContainer);
      };
    }
  }, [data, layout, config]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ width: '100%', height: '100%', minHeight: '300px', ...style }} 
    />
  );
}
