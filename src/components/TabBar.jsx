// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Trophy, User, Mic } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function TabBar({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'home',
    icon: Home,
    label: '首页'
  }, {
    id: 'rank',
    icon: Trophy,
    label: '排行榜'
  }, {
    id: 'profile',
    icon: User,
    label: '我的'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={cn('flex flex-col items-center justify-center w-20 h-full transition-colors', isActive ? 'text-emerald-600' : 'text-gray-400')}>
              <Icon size={24} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>;
      })}
      </div>
    </div>;
}