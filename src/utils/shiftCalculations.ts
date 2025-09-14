interface Job {
  id: string;
  name: string;
  baseRate: number;
  overtimeRate: number;
  shabbatRate: number;
  transportCost: number;
  autoTransport: boolean;
  overtimeAfter: number;
  nightShiftBonus: number;
  location: string;
}

interface ShiftCalculation {
  baseHours: number;
  overtimeHours: number;
  shabbatHours: number;
  nightHours: number;
  transportCost: number;
  baseEarnings: number;
  overtimeEarnings: number;
  shabbatEarnings: number;
  nightBonus: number;
  totalEarnings: number;
  breakdown: string[];
}

export const calculateShiftEarnings = (
  startTime: string,
  endTime: string,
  date: string,
  job: Job
): ShiftCalculation => {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  
  // Handle shifts that cross midnight
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  const totalDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  // Check if it's Shabbat (Friday evening to Saturday evening)
  const dayOfWeek = start.getDay();
  const isShabbat = dayOfWeek === 5 && start.getHours() >= 18 || dayOfWeek === 6;
  
  let baseHours = 0;
  let overtimeHours = 0;
  let shabbatHours = 0;
  let nightHours = 0;
  
  if (isShabbat) {
    shabbatHours = totalDuration;
  } else {
    // Regular day calculation
    baseHours = Math.min(totalDuration, job.overtimeAfter);
    overtimeHours = Math.max(0, totalDuration - job.overtimeAfter);
    
    // Night shift bonus (22:00 - 06:00)
    nightHours = calculateNightHours(start, end);
  }
  
  // Calculate transport cost
  const transportCost = job.autoTransport 
    ? calculateTransportCost(job.baseRate)
    : job.transportCost;
  
  // Calculate earnings
  const baseEarnings = baseHours * job.baseRate;
  const overtimeEarnings = overtimeHours * job.overtimeRate;
  const shabbatEarnings = shabbatHours * job.shabbatRate;
  const nightBonus = nightHours * job.baseRate * (job.nightShiftBonus / 100);
  
  const totalEarnings = baseEarnings + overtimeEarnings + shabbatEarnings + nightBonus + transportCost;
  
  // Create breakdown
  const breakdown: string[] = [];
  if (baseHours > 0) breakdown.push(`${baseHours.toFixed(1)} שעות רגילות: ₪${baseEarnings.toFixed(2)}`);
  if (overtimeHours > 0) breakdown.push(`${overtimeHours.toFixed(1)} שעות נוספות: ₪${overtimeEarnings.toFixed(2)}`);
  if (shabbatHours > 0) breakdown.push(`${shabbatHours.toFixed(1)} שעות שבת: ₪${shabbatEarnings.toFixed(2)}`);
  if (nightHours > 0) breakdown.push(`${nightHours.toFixed(1)} שעות לילה (+${job.nightShiftBonus}%): ₪${nightBonus.toFixed(2)}`);
  if (transportCost > 0) breakdown.push(`נסיעה: ₪${transportCost.toFixed(2)}`);
  
  return {
    baseHours,
    overtimeHours,
    shabbatHours,
    nightHours,
    transportCost,
    baseEarnings,
    overtimeEarnings,
    shabbatEarnings,
    nightBonus,
    totalEarnings,
    breakdown
  };
};

const calculateNightHours = (start: Date, end: Date): number => {
  let nightHours = 0;
  
  // Create night shift boundaries (22:00 to 06:00)
  const nightStart = new Date(start);
  nightStart.setHours(22, 0, 0, 0);
  
  const nightEnd = new Date(start);
  nightEnd.setDate(nightEnd.getDate() + 1);
  nightEnd.setHours(6, 0, 0, 0);
  
  // Check overlap with night hours
  const overlapStart = new Date(Math.max(start.getTime(), nightStart.getTime()));
  const overlapEnd = new Date(Math.min(end.getTime(), nightEnd.getTime()));
  
  if (overlapStart < overlapEnd) {
    nightHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
  }
  
  return Math.max(0, nightHours);
};

const calculateTransportCost = (baseRate: number): number => {
  // Israeli law: transport cost = 7.5% of minimum wage or actual cost
  const minWage = 5300; // 2024 minimum wage
  const transportPercentage = minWage * 0.075;
  return Math.max(30, transportPercentage / 22); // per day
};

export const getSelectedJob = (): Job | null => {
  const jobs = localStorage.getItem('userJobs');
  const selectedJobId = localStorage.getItem('selectedJob');
  
  if (jobs && selectedJobId) {
    const jobsData = JSON.parse(jobs);
    return jobsData.find((job: Job) => job.id === selectedJobId) || null;
  }
  
  return null;
};