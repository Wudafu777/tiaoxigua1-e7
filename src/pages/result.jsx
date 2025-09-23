// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { useToast, Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { ResultCard } from '@/components/ResultCard';
export default function Result(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const result = JSON.parse(props.$w.page.dataset.params?.result || '{}');
  const handleShare = async () => {
    try {
      // 模拟分享功能
      toast({
        title: "分享成功",
        description: "已分享到微信好友"
      });
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (!result) {
    return <div style={style} className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">暂无检测结果</p>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'home'
          })} className="mt-4">
              返回首页
            </Button>
          </div>
        </div>
        <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
        pageId: tab
      })} />
      </div>;
  }
  return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex items-center p-4 bg-white shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold ml-4">检测结果</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <ResultCard result={{
        maturity: result.maturity_percentage,
        sweetness: result.maturity_percentage,
        level: result.maturity_level,
        suggestion: result.advice,
        timestamp: result.timestamp || Date.now()
      }} onShare={handleShare} />
        
        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full" onClick={() => $w.utils.navigateTo({
          pageId: 'home'
        })}>
            <HomeIcon size={16} className="mr-2" />
            再测一个
          </Button>
        </div>
      </div>
      
      <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
}