import { useState, useEffect } from "react";
import { RefreshCw, Filter, Database, Download, ChevronDown, ChevronRight, CalendarIcon, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { fetchSessionSummaries, fetchSessionDetails, fetchAllResults, deleteSession } from "@/lib/experimentService";
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
  created_at: string;
  attention_check_click: boolean | null;
  assigned_group: string | null;
  participant_code: string | null;
}

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
  created_at: string;
}

const MAX_PER_GROUP = 27;
const TOTAL_SLOTS = MAX_PER_GROUP * 3;

const AdminPanel = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [attentionFilter, setAttentionFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionDetails, setSessionDetails] = useState<Record<string, SessionDetail[]>>({});
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

  // Filter sessions by attention check
  const filteredSessions = sessions.filter((session) => {
    if (attentionFilter === "all") return true;
    if (attentionFilter === "clicked") return session.attention_check_click === true;
    if (attentionFilter === "not_clicked") return session.attention_check_click === false;
    if (attentionFilter === "no_data") return session.attention_check_click === null;
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

  const exportToCSV = async () => {
    if (sessions.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Fetch all detailed results with date filter
      const allResults = await fetchAllResults(startDate, endDate);
      
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
        "Attention Check",
        "Created At",
      ];

      const rows = allResults.map((result: any) => {
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
          result.attention_check_click === null
            ? "N/A"
            : result.attention_check_click
            ? "Yes"
            : "No",
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
      link.download = `experiment_results_detailed_${new Date().toISOString().split("T")[0]}.csv`;
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

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold text-foreground">{filteredSessions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Correct Rate</p>
            <p className="text-2xl font-bold text-primary">
              {filteredSessions.length > 0
                ? `${Math.round(
                    (filteredSessions.reduce((sum, s) => sum + s.total_correct, 0) /
                      filteredSessions.reduce((sum, s) => sum + s.total_questions, 0)) *
                      100
                  )}%`
                : '0%'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Reaction Time</p>
            <p className="text-2xl font-bold text-foreground">
              {filteredSessions.length > 0
                ? formatReactionTime(
                    filteredSessions.reduce((sum, s) => sum + s.avg_reaction_time, 0) /
                      filteredSessions.length
                  )
                : '0s'}
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
                <TableHead className="text-center">Attention Check</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-16 text-center">Sil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                            {session.total_correct}/{session.total_questions}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatReactionTime(session.avg_reaction_time)}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.attention_check_click === null ? (
                            <span className="text-muted-foreground">-</span>
                          ) : session.attention_check_click ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-destructive">✗</span>
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
                          <TableCell colSpan={9} className="p-0">
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
                                      {sessionDetails[session.session_id].map((detail, idx) => (
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
                                          <TableCell className="py-2">
                                            Soru {detail.question_index + 1}
                                          </TableCell>
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
