import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Trash2, Settings, Calculator, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  name: string;
  baseRate: number;
  overtimeRate: number;
  shabbatRate: number;
  transportCost: number;
  autoTransport: boolean;
  overtimeAfter: number; // hours
  nightShiftBonus: number; // percentage
  location: string;
}

const JobSettings = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [newJob, setNewJob] = useState({
    name: "",
    baseRate: 35,
    overtimeRate: 52.5, // 1.5x base rate
    shabbatRate: 70, // 2x base rate
    transportCost: 30, // Israeli standard
    autoTransport: true,
    overtimeAfter: 8,
    nightShiftBonus: 25, // 25% night bonus
    location: ""
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    const savedJobs = localStorage.getItem('userJobs');
    if (savedJobs) {
      const jobsData = JSON.parse(savedJobs);
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0].id);
      }
    }
  };

  const saveJobs = (updatedJobs: Job[]) => {
    localStorage.setItem('userJobs', JSON.stringify(updatedJobs));
    localStorage.setItem('selectedJob', selectedJob);
  };

  const addJob = () => {
    if (!newJob.name.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס שם עבודה",
        variant: "destructive",
      });
      return;
    }

    const job: Job = {
      id: Date.now().toString(),
      ...newJob
    };

    const updatedJobs = [...jobs, job];
    setJobs(updatedJobs);
    saveJobs(updatedJobs);
    
    if (jobs.length === 0) {
      setSelectedJob(job.id);
    }

    setNewJob({
      name: "",
      baseRate: 35,
      overtimeRate: 52.5,
      shabbatRate: 70,
      transportCost: 30,
      autoTransport: true,
      overtimeAfter: 8,
      nightShiftBonus: 25,
      location: ""
    });

    toast({
      title: "העבודה נוספה בהצלחה!",
      description: `עבודה "${job.name}" נוספה למערכת`,
    });
  };

  const deleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    saveJobs(updatedJobs);
    
    if (selectedJob === jobId && updatedJobs.length > 0) {
      setSelectedJob(updatedJobs[0].id);
    } else if (updatedJobs.length === 0) {
      setSelectedJob("");
    }

    toast({
      title: "העבודה נמחקה",
      description: "העבודה הוסרה מהמערכת",
    });
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    );
    setJobs(updatedJobs);
    saveJobs(updatedJobs);
  };

  const calculateTransportCost = (baseRate: number): number => {
    // Israeli law: transport cost = 7.5% of minimum wage or actual cost
    const minWage = 5300; // 2024 minimum wage
    const transportPercentage = minWage * 0.075;
    return Math.max(30, transportPercentage / 22); // per day
  };

  const currentJob = jobs.find(job => job.id === selectedJob);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            הגדרות עבודה
          </CardTitle>
          <CardDescription>
            נהל את העבודות שלך, שכר, שעות נוספות ותוספות לפי החוק הישראלי
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Job Selection */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">בחר עבודה פעילה</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger>
                <SelectValue placeholder="בחר עבודה" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name} - ₪{job.baseRate}/שעה
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Current Job Details */}
      {currentJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {currentJob.name}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteJob(currentJob.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>שכר בסיס לשעה (₪)</Label>
                <Input
                  type="number"
                  value={currentJob.baseRate}
                  onChange={(e) => updateJob(currentJob.id, { baseRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>שעות נוספות (₪)</Label>
                <Input
                  type="number"
                  value={currentJob.overtimeRate}
                  onChange={(e) => updateJob(currentJob.id, { overtimeRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>שכר שבת (₪)</Label>
                <Input
                  type="number"
                  value={currentJob.shabbatRate}
                  onChange={(e) => updateJob(currentJob.id, { shabbatRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>שעות נוספות אחרי</Label>
                <Input
                  type="number"
                  value={currentJob.overtimeAfter}
                  onChange={(e) => updateJob(currentJob.id, { overtimeAfter: Number(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>הוצאות נסיעה אוטומטיות</Label>
                  <p className="text-sm text-muted-foreground">
                    חישוב לפי החוק הישראלי (7.5% משכר מינימום)
                  </p>
                </div>
                <Switch
                  checked={currentJob.autoTransport}
                  onCheckedChange={(checked) => updateJob(currentJob.id, { autoTransport: checked })}
                />
              </div>

              {!currentJob.autoTransport && (
                <div>
                  <Label>הוצאות נסיעה יומיות (₪)</Label>
                  <Input
                    type="number"
                    value={currentJob.transportCost}
                    onChange={(e) => updateJob(currentJob.id, { transportCost: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>תוספת לילה (%)</Label>
              <Input
                type="number"
                value={currentJob.nightShiftBonus}
                onChange={(e) => updateJob(currentJob.id, { nightShiftBonus: Number(e.target.value) })}
              />
            </div>

            {/* Rate Summary */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  סיכום תעריפים
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>שעה רגילה:</span>
                    <Badge variant="secondary">₪{currentJob.baseRate}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>שעה נוספת:</span>
                    <Badge variant="outline">₪{currentJob.overtimeRate}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>שבת:</span>
                    <Badge>₪{currentJob.shabbatRate}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>נסיעה יומית:</span>
                    <Badge variant="secondary">
                      ₪{currentJob.autoTransport ? calculateTransportCost(currentJob.baseRate).toFixed(0) : currentJob.transportCost}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Add New Job */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            הוסף עבודה חדשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>שם העבודה</Label>
              <Input
                value={newJob.name}
                onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                placeholder="לדוגמה: מלצר, קופאי..."
              />
            </div>
            <div>
              <Label>מיקום</Label>
              <Input
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="עיר או כתובת"
              />
            </div>
            <div>
              <Label>שכר בסיס לשעה (₪)</Label>
              <Input
                type="number"
                value={newJob.baseRate}
                onChange={(e) => setNewJob({ ...newJob, baseRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>שעות נוספות (₪)</Label>
              <Input
                type="number"
                value={newJob.overtimeRate}
                onChange={(e) => setNewJob({ ...newJob, overtimeRate: Number(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={addJob} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            הוסף עבודה
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSettings;