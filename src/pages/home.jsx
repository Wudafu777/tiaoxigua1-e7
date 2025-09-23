// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Mic, Zap, Trophy } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { RecordingButton } from '@/components/RecordingButton';
export default function Home(props) {
  const {
    $w,
    style
  } = props;
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const {
    toast
  } = useToast();
  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      toast({
        title: "开始录音",
        description: "请敲击西瓜3-5次"
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    // 模拟AI分析过程
    setTimeout(async () => {
      try {
        // 生成随机结果
        const result = {
          maturity_percentage: Math.floor(Math.random() * 30) + 70,
          maturity_level: ['生瓜', '欠熟', '成熟', '过熟'][Math.floor(Math.random() * 4)],
          advice: "这个西瓜成熟度很好，声音清脆，建议尽快食用以获得最佳口感。",
          duration: 4,
          timestamp: Date.now()
        };

        // 保存到历史记录
        await saveToHistory(result);

        // 更新用户排名数据
        await updateUserRanking(result);
        setIsAnalyzing(false);

        // 跳转到结果页
        $w.utils.navigateTo({
          pageId: 'result',
          params: {
            result: JSON.stringify(result)
          }
        });
      } catch (error) {
        toast({
          title: "保存失败",
          description: error.message,
          variant: "destructive"
        });
        setIsAnalyzing(false);
      }
    }, 2000);
  };
  const saveToHistory = async result => {
    await $w.cloud.callDataSource({
      dataSourceName: 'watermelon_analysis',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          maturity_percentage: result.maturity_percentage,
          maturity_level: result.maturity_level,
          advice: result.advice,
          duration: result.duration,
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          audio_url: `https://example.com/audio/${Date.now()}.wav`
        }
      }
    });
  };
  const updateUserRanking = async result => {
    const userId = $w.auth.currentUser?.userId || 'anonymous';
    const nickname = $w.auth.currentUser?.name || '游客';
    const avatar_url = $w.auth.currentUser?.avatarUrl || '';

    // 获取当前用户排名数据
    const existingRank = await $w.cloud.callDataSource({
      dataSourceName: 'user_rankings',
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: {
            user_id: {
              $eq: userId
            }
          }
        }
      }
    });
    if (existingRank.records && existingRank.records.length > 0) {
      // 更新现有记录
      const current = existingRank.records[0];
      const newTotalScans = current.total_scans + 1;
      const newAvgScore = Math.round((current.avg_maturity_score * current.total_scans + result.maturity_percentage) / newTotalScans);
      await $w.cloud.callDataSource({
        dataSourceName: 'user_rankings',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            total_scans: newTotalScans,
            avg_maturity_score: newAvgScore,
            updatedAt: Date.now()
          },
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          }
        }
      });
    } else {
      // 创建新记录
      await $w.cloud.callDataSource({
        dataSourceName: 'user_rankings',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            nickname: nickname,
            avatar_url: avatar_url,
            total_scans: 1,
            avg_maturity_score: result.maturity_percentage,
            city: '北京市',
            district: '朝阳区'
          }
        }
      });
    }
  };
  if (isAnalyzing) {
    return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-80 h-80 flex items-center justify-center">
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <div className="text-lg font-semibold text-emerald-600">AI分析中...</div>
              <div className="text-sm text-gray-500 mt-2">正在分析西瓜成熟度</div>
            </CardContent>
          </Card>
        </div>
        <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
        pageId: tab
      })} />
      </div>;
  }
  return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">AI挑瓜大师</h1>
          <p className="text-gray-600">用AI技术帮你挑选最甜的西瓜</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap size={20} className="mr-2 text-emerald-600" />
              功能介绍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 录音分析西瓜敲击声音</li>
              <li>• AI智能判断成熟度和甜度</li>
              <li>• 保存挑瓜历史记录</li>
              <li>• 与好友比拼挑瓜准确率</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center my-12">
          <RecordingButton isRecording={isRecording} onStart={handleStartRecording} onStop={handleStopRecording} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isRecording ? '点击停止录音' : '点击开始录音，敲击西瓜3-5次'}
          </p>
        </div>
      </div>
      
      <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
}