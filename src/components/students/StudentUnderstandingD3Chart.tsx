import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Session } from '../../types';
import { Sparkles, TrendingUp } from 'lucide-react';

interface StudentUnderstandingD3ChartProps {
  sessions: Session[];
}

export const StudentUnderstandingD3Chart: React.FC<StudentUnderstandingD3ChartProps> = ({ sessions }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    session: Session;
    score: number;
    dateStr: string;
  } | null>(null);

  // Trier les séances par ordre chronologique
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || sortedSessions.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = 280;
    const margin = { top: 20, right: 30, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const data = sortedSessions.map((s, idx) => ({
      index: idx,
      label: `Séeance ${idx + 1}`,
      date: new Date(s.date),
      dateStr: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      score: s.rating?.comprehensionScore ?? Math.round((s.rating?.calculatedScore || 50) / 10),
      session: s,
    }));

    // Scales
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.dateStr))
      .range([0, innerWidth])
      .padding(0.5);

    const y = d3
      .scaleLinear()
      .domain([0, 10]) // Score de compréhension sur 10
      .nice()
      .range([innerHeight, 0]);

    // Grid lines (Y)
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);

    // Axes
    const xAxis = d3.axisBottom(x).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '11px')
      .style('font-weight', '500');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '11px');

    // Remove domain lines for clean modern look
    g.selectAll('.domain').remove();

    // Area generator under the curve
    const area = d3
      .area<any>()
      .x((d) => x(d.dateStr) || 0)
      .y0(innerHeight)
      .y1((d) => y(d.score))
      .curve(d3.curveMonotoneX);

    // Gradient fill
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'comprehension-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.35);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.0);

    // Append Area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#comprehension-gradient)')
      .attr('d', area);

    // Line generator
    const line = d3
      .line<any>()
      .x((d) => x(d.dateStr) || 0)
      .y((d) => y(d.score))
      .curve(d3.curveMonotoneX);

    // Path animation
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 3)
      .attr('d', line);

    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;

    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Dots for data points
    const dots = g
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.dateStr) || 0)
      .attr('cy', (d) => y(d.score))
      .attr('r', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget as SVGCircleElement)
          .transition()
          .duration(150)
          .attr('r', 8)
          .attr('fill', '#4f46e5');

        const [mouseX, mouseY] = d3.pointer(event, container);
        setTooltip({
          x: mouseX,
          y: mouseY - 60,
          session: d.session,
          score: d.score,
          dateStr: d.dateStr,
        });
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget as SVGCircleElement)
          .transition()
          .duration(150)
          .attr('r', 5)
          .attr('fill', '#ffffff');
        setTooltip(null);
      });

    // Fade in dots
    dots.attr('opacity', 0).transition().delay(800).duration(400).attr('opacity', 1);

  }, [sortedSessions]);

  if (sortedSessions.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
        <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
        <span>Aucune séance enregistrée pour cet élève. Le graphique D.3 s'affichera dès la première séance.</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Progression de la Compréhension (D3.js dynamique)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Évolution interactive du score de compréhension (sur /10) au fil des dernières séances.
          </p>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
          D3.js Vectoriel
        </span>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center">
        <svg ref={svgRef} className="overflow-visible" />

        {/* Tooltip interactif */}
        {tooltip && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl flex flex-col gap-0.5 transition-all duration-75"
            style={{
              left: `${Math.min(Math.max(tooltip.x - 60, 10), 320)}px`,
              top: `${tooltip.y}px`,
            }}
          >
            <div className="font-bold flex items-center justify-between gap-2">
              <span>{tooltip.dateStr}</span>
              <span className="text-indigo-300 font-black">{tooltip.score} / 10</span>
            </div>
            <div className="text-[10px] text-slate-300 truncate max-w-[180px]">
              {tooltip.session.subject} • {tooltip.session.chapter}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
