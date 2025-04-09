import React, { useState, useCallback, useRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { motion } from 'framer-motion';

interface DataPoint {
  [key: string]: any;
}

interface ChartProps {
  data: DataPoint[];
  dataKeys: string[];
  xAxisKey?: string;
  colors?: string[];
  height?: number;
  title?: string;
  subtitle?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium text-gray-700">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}: </span>
              <span className="text-sm font-medium ml-1">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Interactive bar chart with animations and hover effects
export const InteractiveBarChart: React.FC<ChartProps> = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'name', 
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'],
  height = 400,
  title,
  subtitle
}) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const handleBarMouseEnter = (data: any, index: number) => {
    setActiveBar(index);
  };

  const handleBarMouseLeave = () => {
    setActiveBar(null);
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                animationDuration={1500}
                onMouseEnter={(data, index) => handleBarMouseEnter(data, index)}
                onMouseLeave={handleBarMouseLeave}
                barSize={activeBar !== null ? 30 : 20}
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    opacity={activeBar === null || activeBar === index ? 1 : 0.6}
                    className="transition-opacity duration-300"
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Interactive line chart with animated path and data points
export const InteractiveLineChart: React.FC<ChartProps> = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'name', 
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'],
  height = 400,
  title,
  subtitle
}) => {
  const [focusedDataPoint, setFocusedDataPoint] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const onMouseMove = (data: any) => {
    if (data && data.activePayload) {
      setFocusedDataPoint(data.activePayload[0].payload);
    }
  };
  
  const onMouseLeave = () => {
    setFocusedDataPoint(null);
  };
  
  const onDotClick = (data: any, index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                activeDot={{
                  r: (dot: any) => activeIndex === dot.index ? 8 : 5,
                  onClick: onDotClick,
                  className: "cursor-pointer transition-all duration-300"
                }}
                dot={{
                  r: 4,
                  fill: colors[index % colors.length],
                  strokeWidth: 2,
                  stroke: '#fff',
                  className: "cursor-pointer"
                }}
                animationDuration={1800}
                animationEasing="ease-in-out"
              />
            ))}
            {focusedDataPoint && (
              <ReferenceLine
                x={focusedDataPoint[xAxisKey]}
                stroke="#888"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            {activeIndex !== null && data[activeIndex] && (
              <ReferenceArea
                x1={data[activeIndex][xAxisKey]}
                x2={data[activeIndex][xAxisKey]}
                y1={0}
                y2="dataMax"
                fill="#8884d8"
                fillOpacity={0.05}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Animated area chart for trend visualization
export const AnimatedAreaChart: React.FC<ChartProps> = ({ 
  data, 
  dataKeys, 
  xAxisKey = 'name', 
  colors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'],
  height = 400,
  title,
  subtitle
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fillOpacity={1}
                fill={`url(#color${key})`}
                animationDuration={2000}
                activeDot={{ r: 6 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Interactive pie chart with animated sectors
export const InteractivePieChart: React.FC<{ 
  data: DataPoint[],
  dataKey: string,
  nameKey: string,
  colors?: string[],
  height?: number,
  title?: string,
  subtitle?: string
}> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#10b981'],
  height = 400,
  title,
  subtitle
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload[nameKey]}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          fontSize={12}
        >{`${payload[nameKey]}: ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
          fontSize={10}
        >
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, [setActiveIndex]);

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex === null ? undefined : activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              dataKey={dataKey}
              nameKey={nameKey}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={1500}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  className="transition-opacity duration-300"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Animated radial bar chart for visual comparison
export const AnimatedRadialBarChart: React.FC<{ 
  data: DataPoint[],
  dataKey: string,
  nameKey: string,
  colors?: string[],
  height?: number,
  title?: string,
  subtitle?: string
}> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#10b981'],
  height = 400,
  title,
  subtitle
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="20%" 
            outerRadius="80%" 
            barSize={20} 
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              label={{ fill: '#666', position: 'insideStart' }}
              background
              dataKey={dataKey}
              nameKey={nameKey}
              animationDuration={2000}
              animationBegin={300}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </RadialBar>
            <Legend 
              iconSize={10} 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ paddingLeft: '20px' }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Interactive scatter chart for data point exploration
export const InteractiveScatterChart: React.FC<{
  data: DataPoint[],
  xDataKey: string,
  yDataKey: string,
  zDataKey?: string,
  nameKey: string,
  colors?: string[],
  height?: number,
  title?: string,
  subtitle?: string
}> = ({
  data,
  xDataKey,
  yDataKey,
  zDataKey,
  nameKey,
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'],
  height = 400,
  title,
  subtitle
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const handleMouseEnter = (data: any, index: number) => {
    setActivePoint(index);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey={xDataKey} 
              type="number" 
              name={xDataKey} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              dataKey={yDataKey} 
              type="number" 
              name={yDataKey} 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={60}
            />
            {zDataKey && (
              <ZAxis 
                dataKey={zDataKey} 
                type="number" 
                range={[60, 400]} 
                name={zDataKey} 
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter 
              name={nameKey} 
              data={data} 
              fill={colors[0]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  opacity={activePoint === null || activePoint === index ? 1 : 0.5}
                  className="transition-opacity duration-300"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Animated progress bar for KPI visualization
export const AnimatedProgressBar: React.FC<{
  value: number;
  maxValue: number;
  label: string;
  color?: string;
  height?: number;
  showValue?: boolean;
}> = ({
  value,
  maxValue,
  label,
  color = "#3b82f6",
  height = 24,
  showValue = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-sm font-medium text-gray-500">
            {value.toLocaleString()} / {maxValue.toLocaleString()}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className="h-2.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Animated counter for numerical data display
export const AnimatedCounter: React.FC<{
  value: number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({
  value,
  label,
  icon,
  color = "#3b82f6",
  prefix = "",
  suffix = "",
  duration = 1.5
}) => {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = value;
    const totalMiliseconds = duration * 1000;
    const incrementTime = totalMiliseconds / end;
    
    let timer: any;
    
    const counter = setInterval(() => {
      start += 1;
      setCount(start);
      
      if (start === end) {
        clearInterval(counter);
      }
    }, incrementTime);
    
    return () => clearInterval(counter);
  }, [value, duration]);
  
  return (
    <motion.div 
      className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <div className="text-xl" style={{ color }}>{icon}</div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold" style={{ color }}>
            {prefix}{count.toLocaleString()}{suffix}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Comparison chart for side-by-side data comparison
export const ComparisonBarChart: React.FC<{
  data: DataPoint[];
  leftDataKey: string;
  rightDataKey: string;
  nameKey: string;
  leftColor?: string;
  rightColor?: string;
  height?: number;
  title?: string;
  subtitle?: string;
  leftLabel?: string;
  rightLabel?: string;
}> = ({
  data,
  leftDataKey,
  rightDataKey,
  nameKey,
  leftColor = "#3b82f6",
  rightColor = "#f97316",
  height = 400,
  title,
  subtitle,
  leftLabel = "Previous",
  rightLabel = "Current"
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              dataKey={nameKey} 
              type="category"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="top" align="center" />
            <Bar 
              dataKey={leftDataKey} 
              name={leftLabel}
              fill={leftColor} 
              animationDuration={1500}
              animationBegin={0}
              barSize={16}
              radius={[0, 4, 4, 0]}
            />
            <Bar 
              dataKey={rightDataKey} 
              name={rightLabel}
              fill={rightColor} 
              animationDuration={1500}
              animationBegin={300}
              barSize={16}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Bubble chart for 3D data visualization
export const BubbleChart: React.FC<{
  data: DataPoint[];
  xAxisKey: string;
  yAxisKey: string;
  zAxisKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
  title?: string;
  subtitle?: string;
}> = ({
  data,
  xAxisKey,
  yAxisKey,
  zAxisKey,
  nameKey,
  colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#10b981'],
  height = 400,
  title,
  subtitle
}) => {
  const RADIAN = Math.PI / 180;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const getPath = (x: number, y: number, width: number, height: number) => {
    return `M${x},${y + height}
            C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2}, ${y}
            C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
            Z`;
  };

  const renderCustomizedShape = (props: any) => {
    const { x, y, width, height, index } = props;
    const isActive = activeIndex === index;
    const radius = isActive ? 10 : 5;
    
    return (
      <path
        d={getPath(x, y, width, height)}
        stroke={colors[index % colors.length]}
        fill={colors[index % colors.length]}
        fillOpacity={isActive ? 0.9 : 0.6}
        strokeWidth={isActive ? 2 : 1}
        className="transition-all duration-300"
        onMouseEnter={() => handleMouseEnter(null, index)}
        onMouseLeave={handleMouseLeave}
      />
    );
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey={xAxisKey} 
              type="number" 
              name={xAxisKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              dataKey={yAxisKey} 
              type="number" 
              name={yAxisKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={60}
            />
            <ZAxis 
              dataKey={zAxisKey} 
              type="number" 
              range={[100, 1000]} 
              name={zAxisKey} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            <Scatter 
              name={nameKey} 
              data={data} 
              fill={colors[0]}
              shape={renderCustomizedShape}
              animationDuration={1500}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};