import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
}

const StatsCard = ({ title, value, change, icon: Icon, color }: StatsCardProps) => {
  const colorConfig = {
    green: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-indigo-600 bg-indigo-50'
  };

  const isPositive = change.startsWith('+');
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <div className="flex items-center space-x-1.5">
          <span className={`text-xs font-bold ${changeColor}`}>{change}</span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">vs last period</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorConfig[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;