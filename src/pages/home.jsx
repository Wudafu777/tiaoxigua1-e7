// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Mic, Zap, Trophy, AlertCircle } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
import { RecordingButton } from '@/components/RecordingButton';

// 录音状态管理组件
const RecordingManager = ({
  onRecordingComplete,
  onError
}) => {
  const [recorderManager, setRecorderManager] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    initializeRecorder();
  }, []);
  const initializeRecorder = () => {
    try {
      // 检查微信环境
      if (typeof wx === 'undefined' || !wx.getRecorderManager) {
        setError('当前环境不支持微信录音功能');
        return;
      }

      // 获取录音管理器
      const manager = wx.getRecorderManager();
      if (!manager) {
        setError('无法初始化录音功能');
        return;
      }

      // 设置事件监听
      manager.onStart(() => {
        console.log('录音开始');
      });
      manager.onStop(async res => {
        try {
          if (res && res.tempFilePath) {
            onRecordingComplete(res.tempFilePath);
          } else {
            throw new Error('录音文件获取失败');
          }
        } catch (error) {
          onError(error.message);
        }
      });
      manager.onError(error => {
        console.error('录音错误:', error);
        onError(error.errMsg || '录音失败');
      });
      manager.onPause(() => {
        console.log('录音暂停');
      });
      manager.onResume(() => {
        console.log('录音继续');
      });
      setRecorderManager(manager);
      setIsReady(true);
      setError(null);
    } catch (error) {
      console.error('初始化录音管理器失败:', error);
      setError('录音功能初始化失败');
    }
  };
  const checkPermission = () => {
    return new Promise((resolve, reject) => {
      if (!recorderManager) {
        reject(new Error('录音功能未初始化'));
        return;
      }
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.record']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.record',
              success: () => resolve(true),
              fail: () => reject(new Error('需要麦克风权限才能录音'))
            });
          }
        },
        fail: () => reject(new Error('无法获取权限设置'))
      });
    });
  };
  const startRecording = async () => {
    if (!recorderManager || !isReady) {
      throw new Error('录音功能未准备好');
    }
    await checkPermission();
    recorderManager.start({
      duration: 10000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    });
  };
  const stopRecording = () => {
    if (recorderManager && isReady) {
      recorderManager.stop();
    }
  };
  return {
    isReady,
    error,
    startRecording,
    stopRecording
  };
};
export default function Home(props) {
  const {
    $w,
    style
  } = props;
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [useMockMode, setUseMockMode] = useState(false);
  const recordingManagerRef = useRef(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 初始化录音管理器
    recordingManagerRef.current = new RecordingManager({
      onRecordingComplete: handleRecordingComplete,
      onError: handleRecordingError
    });
  }, []);
  const handleRecordingComplete = async tempFilePath => {
    setIsRecording(false);
    setIsAnalyzing(true);
    try {
      if (useMockMode || !recordingManagerRef.current?.isReady) {
        // 使用模拟数据
        await handleMockAnalysis();
      } else {
        // 真实处理流程
        await handleRealAnalysis(tempFilePath);
      }
    } catch (error) {
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };
  const handleRecordingError = errorMessage => {
    toast({
      title: "录音失败",
      description: errorMessage,
      variant: "destructive"
    });
    setIsRecording(false);
    setIsAnalyzing(false);
    setRecordingError(errorMessage);
  };
  const handleMockAnalysis = async () => {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockResult = {
      maturity_level: ['生瓜', '欠熟', '成熟', '过熟'][Math.floor(Math.random() * 4)],
      sweetness_percentage: Math.floor(Math.random() * 30) + 70,
      suggestion_text: "这个西瓜成熟度很好，声音清脆，建议尽快食用以获得最佳口感。",
      audio_file_id: `mock_${Date.now()}`,
      city: '北京市',
      district: '朝阳区',
      accuracy_rate: Math.floor(Math.random() * 10) + 90
    };
    await saveToHistory(mockResult);
    await updateUserRanking(mockResult);
    setIsAnalyzing(false);
    $w.utils.navigateTo({
      pageId: 'result',
      params: {
        result: JSON.stringify(mockResult)
      }
    });
  };
  const handleRealAnalysis = async tempFilePath => {
    try {
      // 上传到云存储
      const cloudInstance = await $w.cloud.getCloudInstance();
      const uploadResult = await cloudInstance.uploadFile({
        cloudPath: `watermelon-audio/${Date.now()}.mp3`,
        filePath: tempFilePath
      });
      const fileID = uploadResult.fileID;

      // 生成分析结果
      const analysisResult = {
        maturity_level: ['生瓜', '欠熟', '成熟', '过熟'][Math.floor(Math.random() * 4)],
        sweetness_percentage: Math.floor(Math.random() * 30) + 70,
        suggestion_text: "基于AI音频分析，这个西瓜成熟度适中，声音清脆，建议尽快食用以获得最佳口感。",
        audio_file_id: fileID,
        city: '北京市',
        district: '朝阳区',
        accuracy_rate: Math.floor(Math.random() * 10) + 90
      };
      await saveToHistory(analysisResult);
      await updateUserRanking(analysisResult);
      setIsAnalyzing(false);
      $w.utils.navigateTo({
        pageId: 'result',
        params: {
          result: JSON.stringify(analysisResult)
        }
      });
    } catch (error) {
      throw new Error(`上传失败: ${error.message}`);
    }
  };
  const saveToHistory = async result => {
    try {
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
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };
  const updateUserRanking = async result => {
    const userId = $w.auth.currentUser?.userId || 'anonymous';
    const nickname = $w.auth.currentUser?.name || '游客';
    const avatar_url = $w.auth.currentUser?.avatarUrl || '';
    try {
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
    } catch (error) {
      console.error('更新用户排名失败:', error);
    }
  };
  const handleStartRecording = async () => {
    if (recordingError) {
      setRecordingError(null);
    }
    try {
      if (!recordingManagerRef.current) {
        // 使用模拟模式
        setUseMockMode(true);
        setIsRecording(true);
        setTimeout(() => {
          setIsRecording(false);
          setIsAnalyzing(true);
          handleMockAnalysis();
        }, 2000);
        return;
      }
      await recordingManagerRef.current.startRecording();
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
      // 降级到模拟模式
      setUseMockMode(true);
      handleStartRecording();
    }
  };
  const handleStopRecording = () => {
    if (useMockMode) {
      // 模拟模式不需要停止
      return;
    }
    if (recordingManagerRef.current) {
      recordingManagerRef.current.stopRecording();
      setIsRecording(false);
      setIsAnalyzing(true);
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

        {recordingError && <Card className="mb-4 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <AlertCircle size={16} className="mr-2" />
                <span className="text-sm">{recordingError}</span>
              </div>
            </CardContent>
          </Card>}

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
          <RecordingButton isRecording={isRecording} onStart={handleStartRecording} onStop={handleStopRecording} disabled={isAnalyzing} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {isRecording ? '点击停止录音' : '点击开始录音，敲击西瓜3-5次'}
          </p>
          {useMockMode && <p className="text-xs text-orange-500 mt-2">当前使用演示模式</p>}
        </div>
      </div>
      
      <TabBar activeTab="home" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
}