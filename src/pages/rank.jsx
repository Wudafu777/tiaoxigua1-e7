// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// @ts-ignore;
import { Trophy, TrendingUp } from 'lucide-react';

import { TabBar } from '@/components/TabBar';
export default function Rank(props) {
  const {
    $w,
    style
  } = props;
  const [rankings, setRankings] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadRankings();
  }, []);
  const loadRankings = async () => {
    try {
      // 获取排行榜数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user_rankings',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            total_scans: 'desc'
          }],
          pageSize: 50,
          getCount: true
        }
      });
      const rankingsData = result.records.map(record => ({
        id: record._id,
        name: record.nickname,
        avatar: record.avatar_url,
        count: record.total_scans,
        accuracy: record.avg_maturity_score
      }));
      setRankings(rankingsData);

      // 获取当前用户排名
      const userId = $w.auth.currentUser?.userId || 'anonymous';
      const userRank = await $w.cloud.callDataSource({
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
      if (userRank.records && userRank.records.length > 0) {
        const user = userRank.records[0];
        // 计算排名
        const allUsers = await $w.cloud.callDataSource({
          dataSourceName: 'user_rankings',
          methodName: 'wedaGetRecordsV2',
          params: {
            orderBy: [{
              total_scans: 'desc'
            }],
            getCount: true
          }
        });
        const userRankIndex = allUsers.records.findIndex(r => r.user_id === userId) + 1;
        setCurrentUserRank({
          rank: userRankIndex,
          count: user.total_scans,
          accuracy: user.avg_maturity_score
        });
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <div style={style} className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-center">挑瓜排行榜</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {currentUserRank && <Card className="mb-4 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">我的排名</div>
                  <div className="text-2xl font-bold text-emerald-600">#{currentUserRank.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">挑瓜次数</div>
                  <div className="text-lg font-semibold">{currentUserRank.count}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">平均成熟度</div>
                  <div className="text-lg font-semibold">{currentUserRank.accuracy}%</div>
                </div>
              </div>
            </CardContent>
          </Card>}

        <div className="space-y-3">
          {rankings.map((user, index) => <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {index < 3 ? <Trophy size={24} className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'} /> : <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      挑瓜{user.count}次 · 平均成熟度{user.accuracy}%
                    </div>
                  </div>
                  
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
      
      <TabBar activeTab="rank" onTabChange={tab => $w.utils.navigateTo({
      pageId: tab
    })} />
    </div>;
}