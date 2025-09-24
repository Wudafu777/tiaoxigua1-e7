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
  const [recorderManager, setRecorderManager] = useState(null);
  const [isWeChatEnv, setIsWeChatEnv] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 检查是否在小程序环境中
    const checkWeChatEnv = () => {
      if (typeof wx !== 'undefined' && wx.getRecorderManager) {
        setIsWeChatEnv(true);
        try {
          const manager = wx.getRecorderManager();
          if (manager) {
            setRecorderManager(manager);

            // 监听录音结束事件
            manager.onStop(async res => {
              try {
                await handleAudioUpload(res.tempFilePath);
              } catch (error) {
                toast({
                  title: "录音处理失败",
                  description: error.message,
                  variant: "destructive"
                });
                setIsAnalyzing(false);
              }
            });

            // 监听录音错误
            manager.onError(error => {
              toast({
                title: "录音错误",
                description: error.errMsg,
                variant: "destructive"
              });
              setIsRecording(false);
              setIsAnalyzing(false);
            });
          } else {
            console.warn('无法获取录音管理器');
          }
        } catch (error) {
          console.error('初始化录音管理器失败:', error);
        }
      } else {
        console.warn('当前环境不支持微信录音功能');
      }
    };
    checkWeChatEnv();
  }, []);
  const checkMicrophonePermission = async () => {
    return new Promise((resolve, reject) => {
      if (!isWeChatEnv) {
        reject(new Error('当前环境不支持录音功能'));
        return;
      }
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.record']) {
            // 未授权，请求授权
            wx.authorize({
              scope: 'scope.record',
              success: () => {
                resolve(true);
              },
              fail: () => {
                reject(new Error('需要麦克风权限才能录音'));
              }
            });
          } else {
            resolve(true);
          }
        },
        fail: () => {
          reject(new Error('获取权限设置失败'));
        }
      });
    });
  };
  const handleStartRecording = async () => {
    try {
      if (!isWeChatEnv) {
        // 非微信环境，使用模拟数据
        toast({
          title: "提示",
          description: "当前为演示模式，使用模拟数据"
        });
        handleMockRecording();
        return;
      }
      if (!recorderManager) {
        throw new Error('录音功能初始化失败');
      }
      // 检查权限
      await checkMicrophonePermission();
      // 开始录音
      recorderManager.start({
        duration: 10000,
        // 最长10秒
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      });
      setIsRecording(true);
      toast({
        title: "开始录音",
        description: "请敲击西瓜3-5次，录音最长10秒"
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleStopRecording = () => {
    if (!isWeChatEnv) {
      // 非微信环境，直接结束模拟
      setIsRecording(false);
      setIsAnalyzing(true);
      return;
    }
    if (recorderManager && isRecording) {
      recorderManager.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
    }
  };
  const handleMockRecording = () => {
    // 模拟录音过程
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setIsAnalyzing(true);
      handleMockAnalysis();
    }, 2000);
  };
  const handleMockAnalysis = async () => {
    // 模拟AI分析过程
    setTimeout(async () => {
      try {
        // 生成模拟结果
        const mockResult = {
          maturity_level: ['生瓜', '欠熟', '成熟', '过熟'][Math.floor(Math.random() * 4)],
          sweetness_percentage: Math.floor(Math.random() * 30) + 70,
          suggestion_text: "这个西瓜成熟度很好，声音清脆，建议尽快食用以获得最佳口感。",
          audio_file_id: `mock_audio_${Date.now()}`,
          city: '北京市',
          district: '朝阳区',
          accuracy_rate: Math.floor(Math.random() * 10) + 90
        };
        // 保存到历史记录
        await saveToHistory(mockResult);
        // 更新用户排名
        await updateUserRanking(mockResult);
        setIsAnalyzing(false);
        // 跳转到结果页
        $w.utils.navigateTo({
          pageId: 'result',
          params: {
            result: JSON.stringify(mockResult)
          }
        });
      } catch (error) {
        toast({
          title: "分析失败",
          description: error.message,
          variant: "destructive"
        });
        setIsAnalyzing(false);
      }
    }, 2000);
  };
  const handleAudioUpload = async tempFilePath => {
    try {
      // 上传到云存储
      const cloudInstance = await $w.cloud.getCloudInstance();
      const uploadResult = await cloudInstance.uploadFile({
        cloudPath: `watermelon-audio/${Date.now()}.mp3`,
        filePath: tempFilePath
      });
      const fileID = uploadResult.fileID;
      // 模拟AI分析结果（实际应调用云函数）
      const mockResult = {
        maturity_level: ['生瓜', '欠熟', '成熟', '过熟'][Math.floor(Math.random() * 4)],
        sweetness_percentage: Math.floor(Math.random() * 30) + 70,
        suggestion_text: "这个西瓜成熟度很好，声音清脆，建议尽快食用以获得最佳口感。",
        audio_file_id: fileID,
        city: '北京市',
        district: '朝阳区',
        accuracy_rate: Math.floor(Math.random() * 10) + 90
      };
      // 保存到历史记录
      await saveToHistory(mockResult);
      // 更新用户排名
      await updateUserRanking(mockResult);
      setIsAnalyzing(false);
      // 跳转到结果页
      $w.utils.navigateTo({
        pageId: 'result',
        params: {
          result: JSON.stringify(mockResult)
        }
      });
    } catch (error) {
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };
  const saveToHistory = async result => {
    await $w.cloud.callDataSource({
      dataSourceName: 'watermelon_detection_records',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_openid: $w.auth.currentUser?.userId || 'anonymous',
          audio_file_id: result.audio_file_id,
          maturity_level: result.maturity_level,
          sweetness_percentage: result.sweetness_percentage,
          suggestion_text: result.suggestion_text,
          detection_time: Date.now(),
          city: result.city || '未知城市',
          accuracy_rate: result.accuracy_rate || 95
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
      const newAvgScore = Math.round((current.avg_maturity_score * current.total_scans + result.sweetness_percentage) / newTotalScans);
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
            avg_maturity_score: result.sweetness_percentage,
            city: result.city || '北京市',
            district: result.district || '朝阳区'
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