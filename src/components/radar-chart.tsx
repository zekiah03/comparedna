"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Axes12, AxisKey } from "@/lib/types";
import { AXIS_META } from "@/lib/types";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

const AXIS_ORDER: AxisKey[] = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export function RadarFull({ axes, overlayAxes, color = "#5EEAD4", overlayColor = "#F5B454" }: {
  axes: Axes12;
  overlayAxes?: Axes12;
  color?: string;
  overlayColor?: string;
}) {
  const mounted = useMounted();
  const data = AXIS_ORDER.map(k => ({
    axis: AXIS_META[k].label,
    key: k,
    primary: axes[k],
    ...(overlayAxes ? { overlay: overlayAxes[k] } : {}),
  }));
  return (
    <div className="w-full aspect-square">
      {!mounted ? <div className="w-full h-full" /> : (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--border-default)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "var(--text-dim)", fontSize: 9 }}
            stroke="var(--border-subtle)"
          />
          <Radar
            dataKey="primary"
            stroke={color}
            fill={color}
            fillOpacity={0.28}
            strokeWidth={1.8}
          />
          {overlayAxes && (
            <Radar
              dataKey="overlay"
              stroke={overlayColor}
              fill={overlayColor}
              fillOpacity={0.2}
              strokeWidth={1.8}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

export function RadarMini({ axes }: { axes: Axes12 }) {
  const mounted = useMounted();
  const data = AXIS_ORDER.map(k => ({ axis: k, v: axes[k] }));
  return (
    <div className="w-14 h-14 flex-shrink-0">
      {!mounted ? <div className="w-full h-full" /> : (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid stroke="var(--border-subtle)" />
          <Radar
            dataKey="v"
            stroke="#5EEAD4"
            fill="#5EEAD4"
            fillOpacity={0.35}
            strokeWidth={1.2}
          />
        </RadarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
