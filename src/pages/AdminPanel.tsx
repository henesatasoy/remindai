import { useState, useEffect } from "react";
import { RefreshCw, Filter, Database, Download, ChevronDown, ChevronRight, CalendarIcon, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { fetchSessionSummaries, fetchSessionDetails, fetchAllResults, deleteSession, fetchSessionSidebarInteractions } from "@/lib/experimentService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SessionSummary {
  session_id: string;
  phases: string;
  total_correct: number;
  total_questions: number;
  avg_reaction_time: number;
  fast_response_count: number;
  practice_correct: number;
  practice_total: number;
  practice_avg_reaction_time: number;
  created_at: string;
  attention_check_click: boolean | null;
  assigned_group: string | null;
  participant_code: string | null;
  blur_count: number;
  total_blur_ms: number;
  sidebar_click_count: number;
}

const formatBlurDuration = (ms: number): string => {
  if (ms <= 0) return '0s';
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s === 0 ? `${m}d` : `${m}d ${s}s`;
};

const getGroupLabel = (group: string | null): string => {
  switch (group) {
    case 'positive': return 'Pozitif';
    case 'negative': return 'Negatif';
    case 'control': return 'Kontrol';
    default: return '-';
  }
};

const getGroupBadgeClass = (group: string | null): string => {
  switch (group) {
    case 'positive': return 'bg-emerald-500/10 text-emerald-600';
    case 'negative': return 'bg-rose-500/10 text-rose-600';
    case 'control': return 'bg-slate-500/10 text-slate-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

interface SessionDetail {
  id: string;
  session_id: string;
  phase: string;
  question_index: number;
  is_correct: boolean;
  reaction_time_ms: number;
  timed_out: boolean;
  attention_check_click: boolean | null;
  created_at: string;
}

const MAX_PER_GROUP = 27;
const TOTAL_SLOTS = MAX_PER_GROUP * 3;

const AdminPanel = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [attentionFilter, setAttentionFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionDetails, setSessionDetails] = useState<Record<string, SessionDetail[]>>({});
  const [sessionSidebar, setSessionSidebar] = useState<Record<string, Array<{ id: string; phase: string; element: string; created_at: string }>>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [slotCounts, setSlotCounts] = useState<{ positive: number; negative: number; control: number }>({
    positive: 0,
    negative: 0,
    control: 0,
  });

  const loadSlotCounts = async () => {
    const { data, error } = await supabase
      .from('participant_assignments')
      .select('assigned_group');

    if (error) {
      console.error('Failed to load slot counts:', error);
      return;
    }

    const counts = { positive: 0, negative: 0, control: 0 };
    (data || []).forEach((row: any) => {
      if (row.assigned_group === 'positive') counts.positive += 1;
      else if (row.assigned_group === 'negative') counts.negative += 1;
      else if (row.assigned_group === 'control') counts.control += 1;
    });
    setSlotCounts(counts);
  };

  useEffect(() => {
    loadSlotCounts();
  }, []);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingSession) return;
    
    setDeletingSession(sessionId);
    const success = await deleteSession(sessionId);
    
    if (success) {
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      setSessionDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[sessionId];
        return newDetails;
      });
      setExpandedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
      loadSlotCounts();
      toast.success("Session silindi");
    } else {
      toast.error("Session silinemedi");
    }
    
    setDeletingSession(null);
  };

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchSessionSummaries(phaseFilter, startDate, endDate);
    setSessions(data);
    setIsLoading(false);
    loadSlotCounts();
  };

  // Filter sessions by attention check and assigned group
  const filteredSessions = sessions.filter((session) => {
    // Attention check filter
    if (attentionFilter === "clicked" && session.attention_check_click !== true) return false;
    if (attentionFilter === "not_clicked" && session.attention_check_click !== false) return false;
    if (attentionFilter === "no_data" && session.attention_check_click !== null) return false;

    // Group filter
    if (groupFilter !== "all") {
      if (groupFilter === "unassigned") {
        if (session.assigned_group !== null) return false;
      } else if (session.assigned_group !== groupFilter) {
        return false;
      }
    }

    return true;
  });

  useEffect(() => {
    loadData();
  }, [phaseFilter, startDate, endDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatReactionTime = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const toggleSession = async (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
      // Load details if not already loaded
      if (!sessionDetails[sessionId]) {
        const details = await fetchSessionDetails(sessionId);
        setSessionDetails((prev) => ({ ...prev, [sessionId]: details }));
      }
      if (!sessionSidebar[sessionId]) {
        const sb = await fetchSessionSidebarInteractions(sessionId);
        setSessionSidebar((prev) => ({ ...prev, [sessionId]: sb }));
      }
    }
    setExpandedSessions(newExpanded);
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'practice': return 'Alıştırma';
      case 'phase1': return 'Faz 1';
      case 'phase2': return 'Faz 2';
      default: return phase;
    }
  };

  const exportForSPSS = async () => {
    if (sessions.length === 0) return;
    setIsExporting(true);
    try {
      // Pull every result regardless of phase filter so wide rows are complete
      const allResults = await fetchAllResults(startDate, endDate, "all");

      const { data: assignments } = await supabase
        .from('participant_assignments')
        .select('session_id, assigned_group, participant_code, slot_number');

      const assignmentLookup = new Map<string, { group: string; code: string; slot: number }>();
      (assignments || []).forEach((a: any) => {
        assignmentLookup.set(a.session_id, {
          group: a.assigned_group,
          code: a.participant_code,
          slot: a.slot_number,
        });
      });

      // Group results by session
      const bySession = new Map<string, any[]>();
      (allResults || []).forEach((r: any) => {
        if (!bySession.has(r.session_id)) bySession.set(r.session_id, []);
        bySession.get(r.session_id)!.push(r);
      });

      // Determine max question count per phase across the dataset
      const maxQ = { practice: 0, phase1: 0, phase2: 0 } as Record<string, number>;
      (allResults || []).forEach((r: any) => {
        if (r.question_index >= 0 && maxQ[r.phase] !== undefined) {
          maxQ[r.phase] = Math.max(maxQ[r.phase], r.question_index + 1);
        }
      });

      const headers: string[] = [
        "session_id",
        "participant_code",
        "assigned_group",
        "slot_number",
        "created_at",
        "attention_check_click",
        "blur_count",
        "total_blur_ms",
        "sidebar_click_count",
        // Practice aggregates (kept separate from main metrics)
        "practice_total",
        "practice_correct",
        "practice_accuracy",
        "practice_avg_rt_ms",
        // Phase 1 aggregates
        "phase1_total",
        "phase1_correct",
        "phase1_accuracy",
        "phase1_avg_rt_ms",
        "phase1_fast_count",
        "phase1_timeout_count",
        // Phase 2 aggregates
        "phase2_total",
        "phase2_correct",
        "phase2_accuracy",
        "phase2_avg_rt_ms",
        "phase2_fast_count",
        "phase2_timeout_count",
        // Combined phase1+phase2
        "main_total",
        "main_correct",
        "main_accuracy",
        "main_avg_rt_ms",
        "main_fast_count",
        // Pretest/Posttest correct-only aggregates (for SPSS analyses)
        "Pretest_Total_Correct",
        "Pretest_MeanRT_Correct",
        "Posttest_Total_Correct",
        "Posttest_MeanRT_Correct",
        "Pretest_IES",
        "Posttest_IES",
        "Pretest_Easy_Correct",
        "Pretest_Medium_Correct",
        "Pretest_Hard_Correct",
        "Posttest_Easy_Correct",
        "Posttest_Medium_Correct",
        "Posttest_Hard_Correct",
      ];

      // Per-question wide columns
      const phaseKeys: Array<{ phase: string; prefix: string }> = [
        { phase: "phase1", prefix: "p1" },
        { phase: "phase2", prefix: "p2" },
      ];
      phaseKeys.forEach(({ phase, prefix }) => {
        for (let i = 1; i <= maxQ[phase]; i++) {
          headers.push(`${prefix}_q${i}_correct`, `${prefix}_q${i}_rt_ms`, `${prefix}_q${i}_timed_out`);
        }
      });

      const sessionIds = Array.from(bySession.keys());
      // Fetch focus + sidebar in batches via existing summaries map already in `sessions`
      const summaryMap = new Map<string, SessionSummary>();
      sessions.forEach((s) => summaryMap.set(s.session_id, s));

      const rows = sessionIds.map((sid) => {
        const results = bySession.get(sid) || [];
        const assignment = assignmentLookup.get(sid);
        const summary = summaryMap.get(sid);

        const agg = (phase: string) => {
          const items = results.filter((r) => r.phase === phase && r.question_index >= 0);
          const total = items.length;
          const correct = items.filter((r) => r.is_correct).length;
          const sumRt = items.reduce((s, r) => s + r.reaction_time_ms, 0);
          const fast = items.filter((r) => !r.timed_out && r.reaction_time_ms < 2000).length;
          const timeouts = items.filter((r) => r.timed_out).length;
          return {
            total,
            correct,
            accuracy: total > 0 ? (correct / total).toFixed(4) : "",
            avgRt: total > 0 ? Math.round(sumRt / total) : "",
            fast,
            timeouts,
          };
        };

        const pr = agg("practice");
        const p1 = agg("phase1");
        const p2 = agg("phase2");
        const mainTotal = p1.total + p2.total;
        const mainCorrect = p1.correct + p2.correct;
        const mainSumRt =
          results
            .filter((r) => (r.phase === "phase1" || r.phase === "phase2") && r.question_index >= 0)
            .reduce((s, r) => s + r.reaction_time_ms, 0);
        const mainFast = p1.fast + p2.fast;

        const attention = results.find((r) => r.attention_check_click !== null);
        const createdAt = results.length > 0
          ? results.reduce((min, r) => (r.created_at < min ? r.created_at : min), results[0].created_at)
          : "";

        const row: (string | number)[] = [
          sid,
          assignment?.code ?? "",
          assignment?.group ?? "",
          assignment?.slot ?? "",
          createdAt,
          attention ? (attention.attention_check_click ? "1" : "0") : "",
          summary?.blur_count ?? 0,
          summary?.total_blur_ms ?? 0,
          summary?.sidebar_click_count ?? 0,
          pr.total, pr.correct, pr.accuracy, pr.avgRt,
          p1.total, p1.correct, p1.accuracy, p1.avgRt, p1.fast, p1.timeouts,
          p2.total, p2.correct, p2.accuracy, p2.avgRt, p2.fast, p2.timeouts,
          mainTotal,
          mainCorrect,
          mainTotal > 0 ? (mainCorrect / mainTotal).toFixed(4) : "",
          mainTotal > 0 ? Math.round(mainSumRt / mainTotal) : "",
          mainFast,
        ];

        // Correct-only aggregates per phase
        const correctOnly = (phase: string) => {
          const items = results.filter(
            (r) => r.phase === phase && r.question_index >= 0 && r.is_correct
          );
          const n = items.length;
          const mean = n > 0 ? Math.round(items.reduce((s, r) => s + r.reaction_time_ms, 0) / n) : "";
          return { n, mean };
        };
        const preCorrect = correctOnly("phase1");
        const postCorrect = correctOnly("phase2");
        row.push(preCorrect.n, preCorrect.mean, postCorrect.n, postCorrect.mean);

        // Inverse Efficiency Score = MeanRT_correct / (Total_correct / N_questions)
        const preN = maxQ.phase1 > 0 ? maxQ.phase1 : 12;
        const postN = maxQ.phase2 > 0 ? maxQ.phase2 : 12;
        const preIES =
          preCorrect.n > 0 && typeof preCorrect.mean === "number"
            ? (preCorrect.mean / (preCorrect.n / preN)).toFixed(2)
            : "";
        const postIES =
          postCorrect.n > 0 && typeof postCorrect.mean === "number"
            ? (postCorrect.mean / (postCorrect.n / postN)).toFixed(2)
            : "";
        row.push(preIES, postIES);

        // Posttest difficulty buckets (question numbers 1-based: easy 1-4, medium 5-8, hard 9-12)
        const postCorrectInRange = (lo: number, hi: number) =>
          results.filter(
            (r) =>
              r.phase === "phase2" &&
              r.is_correct &&
              r.question_index + 1 >= lo &&
              r.question_index + 1 <= hi
          ).length;
        row.push(
          postCorrectInRange(1, 4),
          postCorrectInRange(5, 8),
          postCorrectInRange(9, 12)
        );

        phaseKeys.forEach(({ phase, prefix: _prefix }) => {
          for (let i = 0; i < maxQ[phase]; i++) {
            const q = results.find((r) => r.phase === phase && r.question_index === i);
            if (q) {
              row.push(q.is_correct ? "1" : "0", q.reaction_time_ms, q.timed_out ? "1" : "0");
            } else {
              row.push("", "", "");
            }
          }
        });

        return row;
      });

      const escape = (cell: any) => {
        const s = String(cell ?? "");
        return `"${s.replace(/"/g, '""')}"`;
      };

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escape).join(",")),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `experiment_spss_wide_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to export SPSS CSV:", error);
      toast.error("SPSS export başarısız");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    if (sessions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Fetch all detailed results with date filter
      const allResults = await fetchAllResults(startDate, endDate, phaseFilter);
      
      // Fetch participant assignments to enrich the export
      const { data: assignments } = await supabase
        .from('participant_assignments')
        .select('session_id, assigned_group, participant_code');

      const assignmentLookup = new Map<string, { group: string; code: string }>();
      (assignments || []).forEach((a: any) => {
        assignmentLookup.set(a.session_id, {
          group: a.assigned_group,
          code: a.participant_code,
        });
      });

      const headers = [
        "Session ID",
        "Participant Code",
        "Assigned Group",
        "Phase",
        "Question Index",
        "Is Correct",
        "Reaction Time (ms)",
        "Timed Out",
        "Created At",
      ];

      const rows = allResults
        .filter((result: any) => result.phase !== 'practice' && result.question_index >= 0)
        .map((result: any) => {
          const assignment = assignmentLookup.get(result.session_id);
          return [
            result.session_id,
            assignment?.code ?? "",
            assignment?.group ?? "",
            result.phase,
            result.question_index + 1,
            result.is_correct ? "Yes" : "No",
            result.reaction_time_ms,
            result.timed_out ? "Yes" : "No",
            result.created_at,
          ];
        });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const filterPart = phaseFilter === "all" ? "all" : phaseFilter;
      link.download = `experiment_results_${filterPart}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground">Experiment Results Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Başlangıç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={tr}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Bitiş"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={tr}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Phase Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="phase1">Phase 1</SelectItem>
                  <SelectItem value="phase2">Phase 2</SelectItem>
                  <SelectItem value="phase1_2">Faz 1 ve 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Filter */}
            <div className="flex items-center gap-2">
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Grup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  <SelectItem value="positive">Pozitif</SelectItem>
                  <SelectItem value="negative">Negatif</SelectItem>
                  <SelectItem value="control">Kontrol</SelectItem>
                  <SelectItem value="unassigned">Atanmamış</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attention Check Filter */}
            <div className="flex items-center gap-2">
              <Select value={attentionFilter} onValueChange={setAttentionFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Attention Check" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attention</SelectItem>
                  <SelectItem value="clicked">Clicked ✓</SelectItem>
                  <SelectItem value="not_clicked">Not Clicked ✗</SelectItem>
                  <SelectItem value="no_data">No Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              disabled={sessions.length === 0 || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>

            {/* Export for SPSS — Wide format (one row per session) */}
            <Button
              onClick={exportForSPSS}
              variant="outline"
              disabled={sessions.length === 0 || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export for SPSS
            </Button>

            {/* Refresh Button */}
            <Button
              onClick={loadData}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Slot Counter Widget — Drawing Without Replacement progress */}
        {(() => {
          const totalAssigned = slotCounts.positive + slotCounts.negative + slotCounts.control;
          const totalRemaining = TOTAL_SLOTS - totalAssigned;
          const overallPct = Math.min((totalAssigned / TOTAL_SLOTS) * 100, 100);
          const groups = [
            { key: 'positive', label: 'Pozitif', count: slotCounts.positive, barClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
            { key: 'negative', label: 'Negatif', count: slotCounts.negative, barClass: 'bg-rose-500', textClass: 'text-rose-600' },
            { key: 'control', label: 'Kontrol', count: slotCounts.control, barClass: 'bg-slate-500', textClass: 'text-slate-600' },
          ];
          return (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Katılımcı Slot Doluluğu</h2>
                  <p className="text-sm text-muted-foreground">
                    Atanan: <span className="font-medium text-foreground">{totalAssigned}</span> / {TOTAL_SLOTS}
                    {' · '}
                    Kalan: <span className="font-medium text-foreground">{totalRemaining}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{Math.round(overallPct)}%</p>
                  <p className="text-xs text-muted-foreground">tamamlandı</p>
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>

              {/* Per-group breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groups.map((g) => {
                  const pct = Math.min((g.count / MAX_PER_GROUP) * 100, 100);
                  const remaining = MAX_PER_GROUP - g.count;
                  const isFull = g.count >= MAX_PER_GROUP;
                  return (
                    <div key={g.key} className="border border-border rounded-lg p-4 bg-background">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className={`text-sm font-medium ${g.textClass}`}>{g.label}</span>
                        <span className="text-sm font-mono text-foreground">
                          <span className="text-lg font-bold">{g.count}</span>
                          <span className="text-muted-foreground">/{MAX_PER_GROUP}</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${g.barClass} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isFull ? 'Dolu' : `${remaining} slot kaldı`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold text-foreground">{filteredSessions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Correct Rate</p>
            <p className="text-2xl font-bold text-primary">
              {(() => {
                const totalQ = filteredSessions.reduce((sum, s) => sum + s.total_questions, 0);
                const totalC = filteredSessions.reduce((sum, s) => sum + s.total_correct, 0);
                return totalQ > 0 ? `${Math.round((totalC / totalQ) * 100)}%` : '0%';
              })()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Reaction Time</p>
            <p className="text-2xl font-bold text-foreground">
              {(() => {
                const withReal = filteredSessions.filter((s) => s.total_questions > 0);
                return withReal.length > 0
                  ? formatReactionTime(
                      withReal.reduce((sum, s) => sum + s.avg_reaction_time, 0) / withReal.length
                    )
                  : '0s';
              })()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Attention Check Pass</p>
            <p className="text-2xl font-bold text-foreground">
              {filteredSessions.filter((s) => s.attention_check_click === true).length}/
              {filteredSessions.filter((s) => s.attention_check_click !== null).length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Katılımcı</TableHead>
                <TableHead>Phases</TableHead>
                <TableHead className="text-center">Total Correct</TableHead>
                <TableHead className="text-center">Avg Reaction Time</TableHead>
                <TableHead className="text-center">Alıştırma</TableHead>
                <TableHead className="text-center">Hızlı Cevap (&lt;2s)</TableHead>
                <TableHead className="text-center">Attention Check</TableHead>
                <TableHead className="text-center">Sekme Çıkışı</TableHead>
                <TableHead className="text-center">Sidebar</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-16 text-center">Sil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <Collapsible
                    key={session.session_id}
                    open={expandedSessions.has(session.session_id)}
                    onOpenChange={() => toggleSession(session.session_id)}
                    asChild
                  >
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded">
                              {expandedSessions.has(session.session_id) ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {session.session_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {session.participant_code ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-foreground">
                                {session.participant_code}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getGroupBadgeClass(session.assigned_group)}`}
                              >
                                {getGroupLabel(session.assigned_group)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {session.phases.split(', ').map((phase) => (
                              <span
                                key={phase}
                                className={`
                                  px-2 py-0.5 rounded text-xs font-medium
                                  ${phase === 'practice' ? 'bg-blue-500/10 text-blue-500' : ''}
                                  ${phase === 'phase1' ? 'bg-green-500/10 text-green-500' : ''}
                                  ${phase === 'phase2' ? 'bg-purple-500/10 text-purple-500' : ''}
                                `}
                              >
                                {phase}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {session.total_questions > 0
                              ? `${session.total_correct}/${session.total_questions}`
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {session.total_questions > 0 ? formatReactionTime(session.avg_reaction_time) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.practice_total > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-sm">
                                {session.practice_correct}/{session.practice_total}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatReactionTime(session.practice_avg_reaction_time)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.fast_response_count > 0 ? (
                            <span className="font-semibold text-amber-600">
                              {session.fast_response_count}x
                            </span>
                          ) : (
                            <span className="text-green-500">✓</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.attention_check_click === null ? (
                            <span className="text-muted-foreground">-</span>
                          ) : session.attention_check_click ? (
                            <span className="text-green-600 font-medium text-sm">Tıkladı</span>
                          ) : (
                            <span className="text-destructive font-medium text-sm">Tıklamadı</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.blur_count > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="text-destructive font-semibold text-sm">
                                {session.blur_count}x
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatBlurDuration(session.total_blur_ms)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-500">✓</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.sidebar_click_count > 0 ? (
                            <span className="text-destructive font-medium text-sm">Dokundu</span>
                          ) : (
                            <span className="text-green-600 font-medium text-sm">Dokunmadı</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(session.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteSession(session.session_id, e)}
                            disabled={deletingSession === session.session_id}
                          >
                            {deletingSession === session.session_id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={12} className="p-0">
                            <div className="p-4">
                              <h4 className="text-sm font-medium text-foreground mb-3">
                                Soru Detayları
                              </h4>
                              {sessionDetails[session.session_id] ? (
                                <div className="rounded-lg border border-border overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="py-2">Faz</TableHead>
                                        <TableHead className="py-2">Soru #</TableHead>
                                        <TableHead className="py-2 text-center">Sonuç</TableHead>
                                        <TableHead className="py-2 text-center">Tepki Süresi</TableHead>
                                        <TableHead className="py-2 text-center">Zaman Aşımı</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sessionDetails[session.session_id]
                                        .filter((detail) => detail.question_index >= 0)
                                        .map((detail, idx) => (
                                        <TableRow key={detail.id || idx} className="text-sm">
                                          <TableCell className="py-2">
                                            <span
                                              className={`
                                                px-2 py-0.5 rounded text-xs font-medium
                                                ${detail.phase === 'practice' ? 'bg-blue-500/10 text-blue-500' : ''}
                                                ${detail.phase === 'phase1' ? 'bg-green-500/10 text-green-500' : ''}
                                                ${detail.phase === 'phase2' ? 'bg-purple-500/10 text-purple-500' : ''}
                                              `}
                                            >
                                              {getPhaseLabel(detail.phase)}
                                            </span>
                                          </TableCell>
                                          <TableCell className="py-2">Soru {detail.question_index + 1}</TableCell>
                                          <TableCell className="py-2 text-center">
                                            {detail.is_correct ? (
                                              <span className="text-green-500 font-medium">Doğru</span>
                                            ) : (
                                              <span className="text-destructive font-medium">Yanlış</span>
                                            )}
                                          </TableCell>
                                          <TableCell className="py-2 text-center">
                                            {formatReactionTime(detail.reaction_time_ms)}
                                          </TableCell>
                                          <TableCell className="py-2 text-center">
                                            {detail.timed_out ? (
                                              <span className="text-amber-500">Evet</span>
                                            ) : (
                                              <span className="text-muted-foreground">Hayır</span>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                              )}

                              {/* Sidebar / Prompt Interactions */}
                              <h4 className="text-sm font-medium text-foreground mt-6 mb-3">
                                Sidebar &amp; Prompt Etkileşimleri
                              </h4>
                              {sessionSidebar[session.session_id] ? (
                                sessionSidebar[session.session_id].length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    Bu oturumda sahte sidebar veya prompt etkileşimi kaydedilmemiş.
                                  </p>
                                ) : (
                                  <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="py-2">Faz</TableHead>
                                          <TableHead className="py-2">Etkileşim</TableHead>
                                          <TableHead className="py-2">Detay</TableHead>
                                          <TableHead className="py-2">Zaman</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {sessionSidebar[session.session_id].map((ev) => {
                                          const [kind, ...rest] = ev.element.split(":");
                                          const detailText = rest.join(":");
                                          const labelMap: Record<string, string> = {
                                            new_chat: "Yeni Sohbet",
                                            chat_history: "Sohbet Geçmişi",
                                            prompt_attach_click: "Attach Butonu (home)",
                                            prompt_mic_click: "Mic Butonu (home)",
                                            sidebar_prompt_input: "Sidebar Prompt'a Yazıldı",
                                            sidebar_prompt_attach_click: "Sidebar Attach Butonu",
                                            sidebar_prompt_mic_click: "Sidebar Mic Butonu",
                                            ai_terminal_prompt_input: "Terminal Prompt'a Yazıldı",
                                            ai_terminal_prompt_attach_click: "Terminal Attach Butonu",
                                            ai_terminal_prompt_mic_click: "Terminal Mic Butonu",
                                          };
                                          return (
                                            <TableRow key={ev.id} className="text-sm">
                                              <TableCell className="py-2">
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                                                  {ev.phase}
                                                </span>
                                              </TableCell>
                                              <TableCell className="py-2">
                                                {labelMap[kind] ?? kind}
                                              </TableCell>
                                              <TableCell className="py-2 text-muted-foreground max-w-md truncate">
                                                {detailText || "-"}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-muted-foreground">
                                                {formatDate(ev.created_at)}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )
                              ) : (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
