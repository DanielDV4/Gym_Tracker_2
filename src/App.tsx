import React, { useState, useEffect } from 'react';
import { Exercise } from './types';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { WorkoutLogger } from './components/WorkoutLogger';
import { DartCodeInspector } from './components/DartCodeInspector';
import { BottomNavBar } from './components/BottomNavBar';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('workout');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [strikeCounts, setStrikeCounts] = useState<Record<string, number>>({
    bench_press: 0,
    overhead_press: 1,
    barbell_squat: 0,
    bicep_curl: 2,
    pull_up: 0,
    tricep_pushdown: 3,
  });

  const [currentWeights, setCurrentWeights] = useState<Record<string, number>>({
    bench_press: 135.0,
    overhead_press: 95.0,
    barbell_squat: 225.0,
    bicep_curl: 35.0,
    pull_up: 25.0,
    tricep_pushdown: 45.0,
  });

  useEffect(() => {
    fetch('/assets/data/exercises.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load asset');
        return res.json();
      })
      .then((data: Exercise[]) => {
        setExercises(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback static exercise catalog
        setExercises([
          {
            id: 'bench_press',
            name: 'Barbell Bench Press',
            category: 'COMPOUND',
            baseIncrement: 5.0,
            maxWeightCapacity: 500.0,
            sets: 4,
            targetReps: 8,
            mechanic: 'Compound',
            equipment: 'Barbell',
          },
          {
            id: 'overhead_press',
            name: 'Barbell Overhead Press',
            category: 'COMPOUND',
            baseIncrement: 2.5,
            maxWeightCapacity: 300.0,
            sets: 3,
            targetReps: 8,
            mechanic: 'Compound',
            equipment: 'Barbell',
          },
          {
            id: 'barbell_squat',
            name: 'Barbell Back Squat',
            category: 'COMPOUND',
            baseIncrement: 5.0,
            maxWeightCapacity: 700.0,
            sets: 4,
            targetReps: 6,
            mechanic: 'Compound',
            equipment: 'Barbell',
          },
          {
            id: 'bicep_curl',
            name: 'Dumbbell Bicep Curl',
            category: 'ISOLATION',
            baseIncrement: 2.5,
            maxWeightCapacity: 120.0,
            sets: 3,
            targetReps: 12,
            mechanic: 'Isolation',
            equipment: 'Dumbbell',
          },
          {
            id: 'pull_up',
            name: 'Weighted Pull Up',
            category: 'BODYWEIGHT',
            baseIncrement: 2.5,
            maxWeightCapacity: 200.0,
            sets: 3,
            targetReps: 10,
            mechanic: 'Compound',
            equipment: 'Bodyweight',
          },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-start font-sans antialiased selection:bg-blue-600 selection:text-white">
      <div
        className={`w-full transition-all duration-300 flex flex-col min-h-screen ${
          isMobileFrame
            ? 'max-w-[420px] bg-[#0D0D0D] my-0 sm:my-6 border-0 sm:border border-[#2C2C2E] rounded-0 sm:rounded-[36px] shadow-2xl overflow-hidden min-h-[840px] relative'
            : 'max-w-4xl bg-[#0D0D0D] min-h-screen relative'
        }`}
      >
        <Header
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  exercises={exercises}
                  strikeCounts={strikeCounts}
                  currentWeights={currentWeights}
                  onStartWorkout={() => setActiveTab('workout')}
                />
              )}

              {activeTab === 'workout' && (
                <WorkoutLogger allExercises={exercises} />
              )}

              {activeTab === 'code' && <DartCodeInspector />}
            </>
          )}
        </main>

        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
