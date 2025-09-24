// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Home as HomeIcon, Share2, CheckCircle } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function Result(props) {
  const {
    $w,
    style
  } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const {
    toast
  } = useToast();

  // 解析传递的数据
  const getResultData = () => {
    try {
      const params = props.$w.page.dataset.params;
      if (!params || !params.result) {
        return null;
      }
      return JSON.parse(params.result);
    } catch (error) {
      console.error('解析结果数据失败:', error);
      return null;
    }
  };
  const result = getResultData();

  // 组件挂载时自动保存记录
  useEffect(() => {
    if (result && !isSaved) {
      saveDetectionRecord();
    }
  }, [result]);
  const saveDetectionRecord = async () => {
    if (!result || isSaved) return;
    setIsSaving(true);
    try {
      // 调用云函数保存检测记录
      const saveResult = await $w.cloud.callFunction({
        name: 'saveRecord',
        data: {
          user_openid: $w.auth.currentUser?.userId || 'anonymous',
          audio_file_id: result.audio_file_id || '',
          maturity_level: result.maturity_level,
          sweetness_percentage: result.sweetness_percentage,
          suggestion_text: result.suggestion_text,
          city: result.city || '未知城市',
          accuracy_rate: result.accuracy_rate || 95,
          detection_time: Date.now()
        }
      });
      if (saveResult.result && saveResult.result.success) {
        setIsSaved(true);
        toast({
          title: "保存成功",
          description: "检测记录已保存到个人中心",
          duration: 3000
        });
      } else {
        throw new Error(saveResult.result?.message || '保存失败');
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleShare = async () => {
    try {
      // 构建分享内容
      const shareContent = {
        title: `AI挑瓜结果 - ${result.maturity_level}`,
        desc: `甜度${result.sweetness_percentage}%，${result.suggestion_text.substring(0, 30)}...`,
        path: `/pages/result?result=${encodeURIComponent(JSON.stringify(result))}`
      };

      // 模拟分享功能
      toast({
        title: "分享成功",
        description: "已生成分享卡片"
      });
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getLevelColor = level => {
    switch (level) {
      case '生瓜':
        return 'text-red-500 bg-red-50';
      case '欠熟':
        return 'text-orange-500 bg-orange-50';
      case '成熟':
        return 'text-emerald-500 bg-emerald-50';
      case '过熟':
        return 'text-purple-500 bg-purple-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };
  const getLevelIcon = level => {
    switch (level) {
      case '生瓜':
        return '🌱';
      case '欠熟':
        return '🍈';
      case '成熟':
        return '🍉';
      case '过熟':
        return '🍉💦';
      default:
        return '🍉';
    }
  };
  if (!result) {
    return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="flex items-center p-4 bg-white shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => $w.utils.navigateBack()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold ml-4">检测结果</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">暂无检测结果</p>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'home'
          })}>
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

      <div className="flex-1 overflow-y-auto p-4">
        {/* 保存状态提示 */}
        {isSaving && <Card className="mb-4 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">正在保存检测记录...</span>
              </div>
            </CardContent>
          </Card>}

        {isSaved && <Card className="mb-4 bg-emerald-50">
            <CardContent className="p-3">
              <div className="flex items-center text-emerald-600">
                <CheckCircle size={16} className="mr-2" />
                <span className="text-sm">已保存到个人中心</span>
              </div>
            </CardContent>
          </Card>}

        {/* 结果展示卡片 */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{getLevelIcon(result.maturity_level)}</div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {result.sweetness_percentage}%
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(result.maturity_level)}`}>
                {result.maturity_level}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{result.sweetness_percentage}%</div>
                <div className="text-sm text-gray-600">甜度指数</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.accuracy_rate || 95}%</div>
                <div className="text-sm text-gray-600">AI置信度</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">AI建议</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {result.suggestion_text}
              </div>
            </div>

            {result.city && result.city !== '未知城市' && <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">
                  <span className="font-medium">检测地点：</span>{result.city}
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button onClick={handleShare} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
            <Share2 size={16} className="mr-2" />
            分享结果
          </Button>

          <Button variant="outline" className="w-full" onClick={() => $w.utils.navigateTo({
          pageId: 'home'
        })}>
            <HomeIcon size={16} className="mr-2" />
            再测一个
          </Button>

          <Button variant="outline" className="w-full" onClick={() => $w.utils.navigateTo({
          pageId: 'profile'
        })}>
            查看历史记录
          </Button>
        </div>

        {/* 检测详情 */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">检测详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">检测时间：</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">录音文件：</span>
                <span className="text-xs text-gray-500 truncate max-w-32">
                  {result.audio_file_id ? '已上传' : '本地分析'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
}