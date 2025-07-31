import React from 'react';
import { AreaChart, BarChart } from '@tremor/react';

interface SparkAreaChartProps {
  data: { date: string; value: number }[];
  color?: string;
  className?: string;
}

export const SparkAreaChart: React.FC<SparkAreaChartProps> = ({
  data,
  color = 'blue',
  className = 'h-12 w-24',
}) => {
  return (
    <AreaChart
      className={className}
      data={data}
      index="date"
      categories={['value']}
      colors={[color as any]}
      showXAxis={false}
      showYAxis={false}
      showGridLines={false}
      showLegend={false}
      showTooltip={false}
      fill="gradient"
    />
  );
};

interface SparkBarChartProps {
  data: { date: string; value: number }[];
  color?: string;
  className?: string;
}

export const SparkBarChart: React.FC<SparkBarChartProps> = ({
  data,
  color = 'emerald',
  className = 'h-12 w-24',
}) => {
  return (
    <BarChart
      className={className}
      data={data}
      index="date"
      categories={['value']}
      colors={[color as any]}
      showXAxis={false}
      showYAxis={false}
      showGridLines={false}
      showLegend={false}
      showTooltip={false}
    />
  );
};

interface SparkLineData {
  date: string;
  value: number;
}

interface StatCardWithSparkProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  sparkData: SparkLineData[];
  sparkType: 'area' | 'bar';
  color: string;
}

export const StatCardWithSpark: React.FC<StatCardWithSparkProps> = ({
  title,
  value,
  change,
  changeType,
  sparkData,
  sparkType,
  color,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
          </p>
          <p className={`text-sm mt-1 ${getChangeColor()}`}>
            {change}
          </p>
        </div>
        <div className="ml-4">
          {sparkType === 'area' ? (
            <SparkAreaChart data={sparkData} color={color} />
          ) : (
            <SparkBarChart data={sparkData} color={color} />
          )}
        </div>
      </div>
    </div>
  );
};

interface TrendingStatsProps {
  stats: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'flat';
    sparkData: SparkLineData[];
  }>;
}

export const TrendingStats: React.FC<TrendingStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </span>
            <div className="flex items-center">
              {stat.trend === 'up' && (
                <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {stat.trend === 'down' && (
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {stat.trend === 'flat' && (
                <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </span>
            <SparkAreaChart 
              data={stat.sparkData} 
              className="h-8 w-16" 
              color={stat.trend === 'up' ? 'emerald' : stat.trend === 'down' ? 'red' : 'gray'}
            />
          </div>
        </div>
      ))}
    </div>
  );
}; 