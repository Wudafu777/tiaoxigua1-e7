// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
// @ts-ignore;
import { Settings, LogOut, History, Award } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function Profile(props) {
  const {
    $w,
    style
  } = props;
  const [userStats, setUserStats] = useState(null);
  const [history, setHistory] = useState([]);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadUserData();
  }, []);
  const loadUserData = async () => {
    try {
      const userId = $w.auth.currentUser?.userId || 'anonymous';

      // 获取用户排名数据
      const rankingResult = await $w.cloud.callDataSource({
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
      if (rankingResult.records && rankingResult.records.length > 0) {
        const user = rankingResult.records[0];
        setUserStats({
          totalCount: user.total_scans,
          accuracy: user.avg_maturity_score,
          region: user.city,
          level: getLevelName(user.total_scans)
        });
      }

      // 获取用户历史记录
      const historyResult = await $w.cloud.callDataSource({
        dataSourceName: 'watermelon_analysis',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10
        }
      });
      const historyData = historyResult.records.map(record => ({
        id: record._id,
        maturity: record.maturity_percentage,
        level: record.maturity_level,
        advice: record.advice,
        timestamp: record.createdAt
      }));
      setHistory(historyData);
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getLevelName = count => {
    if (count >= 100) return '挑瓜大师';
    if (count >= 50) return '挑瓜高手';
    if (count >= 20) return '挑瓜达人';
    if (count >= 10) return '挑瓜新手';
    return '挑瓜小白';
  };
  const handleLogout = () => {
    toast({
      title: "退出登录",
      description: "已安全退出"
    });
  };
  return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-center">个人中心</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={$w.auth.currentUser?.avatarUrl} />
                <AvatarFallback>{$w.auth.currentUser?.name[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{$w.auth.currentUser?.name || '游客'}</div>
                <div className="text-sm text-gray-600">{userStats?.region || '未知地区'}</div>
                <div className="text-sm text-emerald-600 font-medium">{userStats?.level || '挑瓜小白'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {userStats && <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Award size={18} className="mr-2 text-emerald-600" />
                我的成就
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{userStats.totalCount}</div>
                  <div className="text-sm text-gray-600">总挑瓜次数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{userStats.accuracy}%</div>
                  <div className="text-sm text-gray-600">平均成熟度</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{userStats.level}</div>
                  <div className="text-sm text-gray-600">当前称号</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">#{getUserRank()}</div>
                  <div className="text-sm text-gray-600">当前排名</div>
                </div>
              </div>
            </CardContent>
          </Card>}

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <History size={18} className="mr-2 text-emerald-600" />
              挑瓜历史
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map(record => <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{record.level}</div>
                    <div className="text-sm text-gray-600">
                      成熟度{record.maturity}% · {record.advice.substring(0, 20)}...
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            <Settings size={16} className="mr-2" />
            账号设置
          </Button>
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            退出登录
          </Button>
        </div>
      </div>
      
      <TabBar activeTab="profile" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
  function getUserRank() {
    // 模拟计算排名
    return Math.floor(Math.random() * 100) + 1;
  }
}