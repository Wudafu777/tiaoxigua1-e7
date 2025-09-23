// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Share2, Clock, TrendingUp } from 'lucide-react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ResultCard({
  result,
  onShare
}) {
  const {
    maturity,
    sweetness,
    level,
    suggestion,
    timestamp
  } = result;
  const getLevelColor = level => {
    switch (level) {
      case '生瓜':
        return 'text-red-500';
      case '欠熟':
        return 'text-orange-500';
      case '成熟':
        return 'text-emerald-500';
      case '过熟':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };
  return <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">检测结果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-600">{maturity}%</div>
          <div className={cn("text-lg font-semibold", getLevelColor(level))}>{level}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-sm text-gray-600">甜度</div>
            <div className="text-xl font-bold text-emerald-600">{sweetness}%</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">检测时间</div>
            <div className="text-sm font-medium">{new Date(timestamp).toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">建议</div>
          <div className="text-sm text-gray-600">{suggestion}</div>
        </div>

        <Button onClick={onShare} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
          <Share2 size={16} className="mr-2" />
          分享结果
        </Button>
      </CardContent>
    </Card>;
}