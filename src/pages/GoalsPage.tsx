import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Target, Calendar, Zap, Trophy, Plus, Edit2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useYogicData } from '@/hooks/use-yogic-data';

interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  target: number;
  current: number;
  unit: 'steps' | 'minutes' | 'calories' | 'distance';
  isActive: boolean;
  deadline?: string;
  reward?: string;
}

const PRESET_GOALS = [
  { title: 'Daily Steps', target: 8000, unit: 'steps', type: 'daily' },
  { title: 'Weekly Steps', target: 50000, unit: 'steps', type: 'weekly' },
  { title: 'Monthly Challenge', target: 200000, unit: 'steps', type: 'monthly' },
  { title: 'Walk 30 Minutes', target: 30, unit: 'minutes', type: 'daily' },
];

export function GoalsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dailyProgress } = useYogicData();
  
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      type: 'daily',
      title: 'Daily Steps Goal',
      target: 10000,
      current: dailyProgress.steps % 10000, // Mock current progress
      unit: 'steps',
      isActive: true,
      reward: '50 bonus coins'
    },
    {
      id: '2', 
      type: 'weekly',
      title: 'Weekly Distance Challenge',
      target: 35000,
      current: 22500,
      unit: 'steps',
      isActive: true,
      deadline: '2024-09-25',
      reward: 'Achievement unlock'
    },
    {
      id: '3',
      type: 'monthly',
      title: 'Monthly Milestone',
      target: 150000,
      current: 89000,
      unit: 'steps',
      isActive: false,
      deadline: '2024-09-30'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 8000,
    type: 'daily' as const,
    unit: 'steps' as const
  });

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Goal Title Required",
        description: "Please enter a title for your goal.",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      target: newGoal.target,
      current: 0,
      type: newGoal.type,
      unit: newGoal.unit,
      isActive: true
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', target: 8000, type: 'daily', unit: 'steps' });
    setShowCreateForm(false);

    toast({
      title: "Goal Created! 🎯",
      description: `Your ${newGoal.type} goal has been set.`,
    });
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    ));
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Target className="w-4 h-4" />;
      case 'weekly': return <Calendar className="w-4 h-4" />;
      case 'monthly': return <Trophy className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusColor = (goal: Goal) => {
    const percentage = getProgressPercentage(goal);
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const activeGoals = goals.filter(g => g.isActive);
  const completedToday = goals.filter(g => getProgressPercentage(g) >= 100).length;

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Goals & Targets
            </h1>
            <p className="text-muted-foreground">Set and track your wellness objectives</p>
          </div>
        </div>

        {/* Goals Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{activeGoals.length}</div>
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{completedToday}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {Math.round(activeGoals.reduce((sum, goal) => sum + getProgressPercentage(goal), 0) / activeGoals.length)}%
              </div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Goals
            </CardTitle>
            <Button 
              onClick={() => setShowCreateForm(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => {
              const percentage = getProgressPercentage(goal);
              return (
                <Card key={goal.id} className={`${goal.isActive ? 'border-primary/30' : 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-primary/10 ${getStatusColor(goal)}`}>
                          {getGoalIcon(goal.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {goal.type}
                            </Badge>
                            {goal.deadline && (
                              <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {percentage >= 100 && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                        <Switch
                          checked={goal.isActive}
                          onCheckedChange={() => toggleGoal(goal.id)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}</span>
                        <span className={`font-semibold ${getStatusColor(goal)}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {goal.reward && (
                      <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                        <p className="text-sm text-accent-foreground">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          Reward: {goal.reward}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Create Goal Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Daily Walking Goal"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value as any }))}
                  >
                    <option value="steps">Steps</option>
                    <option value="minutes">Minutes</option>
                    <option value="calories">Calories</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Goal Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newGoal.type}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateGoal} className="flex-1">
                  Create Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Preset Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose from popular wellness goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_GOALS.map((preset, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30"
                  onClick={() => {
                    setNewGoal({
                      title: preset.title,
                      target: preset.target,
                      type: preset.type as any,
                      unit: preset.unit as any
                    });
                    setShowCreateForm(true);
                  }}
                >
                  <CardContent className="p-3 text-center">
                    {getGoalIcon(preset.type)}
                    <h4 className="font-semibold text-sm mt-2">{preset.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {preset.target.toLocaleString()} {preset.unit}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-primary">Stay Focused!</h3>
            <p className="text-sm text-muted-foreground">
              "A goal without a plan is just a wish. Set clear targets and watch yourself achieve them step by step."
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}