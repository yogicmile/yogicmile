import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Trophy, Star } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string | null;
  progress: number;
  target: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Walk 100 steps',
    icon: '👣',
    rarity: 'common',
    earned_at: null,
    progress: 0,
    target: 100,
  },
  {
    id: '2',
    name: 'Marathon Walker',
    description: 'Walk 10,000 steps in a day',
    icon: '🏃',
    rarity: 'rare',
    earned_at: null,
    progress: 0,
    target: 10000,
  },
  {
    id: '3',
    name: 'Week Warrior',
    description: 'Walk 7 days in a row',
    icon: '⚔️',
    rarity: 'epic',
    earned_at: null,
    progress: 0,
    target: 7,
  },
  {
    id: '4',
    name: 'Month Master',
    description: 'Walk 30 days in a row',
    icon: '👑',
    rarity: 'legendary',
    earned_at: null,
    progress: 0,
    target: 30,
  },
  {
    id: '5',
    name: 'Coin Collector',
    description: 'Earn 1000 Paisa',
    icon: '💰',
    rarity: 'rare',
    earned_at: null,
    progress: 0,
    target: 1000,
  },
];

const rarityColors = {
  common: 'border-gray-400 bg-gray-100',
  rare: 'border-blue-400 bg-blue-100',
  epic: 'border-purple-400 bg-purple-100',
  legendary: 'border-yellow-400 bg-yellow-100',
};

const rarityTextColors = {
  common: 'text-gray-700',
  rare: 'text-blue-700',
  epic: 'text-purple-700',
  legendary: 'text-yellow-700',
};

export const AchievementsGalleryPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserAchievements();
    }
  }, [user]);

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const unlockedIds = data?.map((a: any) => a.achievement_id) || [];
      setUnlockedCount(unlockedIds.length);

      const updated = achievements.map((achievement) => ({
        ...achievement,
        earned_at: unlockedIds.includes(achievement.id) ? new Date().toISOString() : null,
      }));

      setAchievements(updated);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleShare = (achievement: Achievement) => {
    const text = `I just unlocked the "${achievement.name}" achievement on YogicMile! ${achievement.icon}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'YogicMile Achievement',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Achievement copied to clipboard!');
    }
  };

  const unlockedPercentage = achievements.length > 0 
    ? Math.round((unlockedCount / achievements.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-gray-600">Unlock badges and celebrate your progress</p>
        </div>

        <Card className="mb-6 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Unlocked Achievements</p>
                <p className="text-2xl font-bold text-purple-600">{unlockedCount}/{achievements.length}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{unlockedPercentage}%</div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${unlockedPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`${rarityColors[achievement.rarity]} border-2 transition-transform hover:scale-105`}
            >
              <CardHeader className="pb-3">
                <div className="text-5xl mb-2">{achievement.icon}</div>
                <CardTitle className={`text-lg ${rarityTextColors[achievement.rarity]}`}>
                  {achievement.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">{achievement.description}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.target}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {achievement.earned_at ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" /> Unlocked
                    </span>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(achievement)}
                      className="gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">Locked</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsGalleryPage;
