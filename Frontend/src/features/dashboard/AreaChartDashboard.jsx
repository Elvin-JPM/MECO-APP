import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

import styled from "styled-components";

const StyledChart = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: var(--color-grey-50);
  margin-top: 3rem;
  padding: 2rem;
  opacity: 0.95;
  border-radius: 2rem;
  width: 100%;
  height: 350px;
`;

function AreaChartDashboard({ title, profMP, profMR }) {
  console.log("Prof mp: ", profMP);
  console.log("Prof mr: ", profMR);

  // Merge data based on 'fecha' key
  const mergedData = profMP.map((itemMP) => {
    const matchingItem = profMR.find((itemMR) => itemMR.fecha === itemMP.fecha);

    return {
      fecha: itemMP.fecha,
      kwh_mp: itemMP.dato_energia,
      kwh_mr: matchingItem?.dato_energia || 0,
    };
  });

  console.log("Merged data: ", mergedData);

  return (
    <StyledChart>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={900}
          height={310}
          data={mergedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            {/* Gradient for MP */}
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-institucional-rojo)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-institucional-rojo)"
                stopOpacity={0.2}
              />
            </linearGradient>

            {/* Gradient for MR */}
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-institucional-celeste)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-institucional-celeste)"
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>

          {/* X-Axis with Label */}
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 12, fill: "var(--color-grey-800)" }}
          >
            <Label
              value="Fecha"
              offset={-10}
              position="insideBottom"
              style={{ fontSize: 16 }}
            />
          </XAxis>

          {/* Y-Axis with Label */}
          <YAxis tick={{ fontSize: 12, fill: "var(--color-grey-800)" }}>
            <Label
              value="Energía (kWh)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>

          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-grey-100)",
              borderRadius: "10px",
              border: "1px solid var(--color-grey-300)",
            }}
            //   itemStyle={{ color: "black", fontWeight: "bold" }}
            labelStyle={{ color: "var(--color-grey-800)", fontSize: "14px" }}
          />

          {/* Area for MP */}
          <Area
            type="monotone"
            dataKey="kwh_mp"
            stroke="var(--color-red-600)"
            fillOpacity={1}
            fill="url(#colorUv)"
          />

          {/* Area for MR */}
          <Area
            type="monotone"
            dataKey="kwh_mr"
            stroke="var(--color-institucional-celeste)"
            fillOpacity={1}
            fill="url(#colorPv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledChart>
  );
}

export default AreaChartDashboard;
