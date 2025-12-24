import { useState, useEffect } from "react";
import { RefreshCw, Filter, Database, Download } from "lucide-react";
import { fetchSessionSummaries } from "@/lib/experimentService";
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

interface SessionSummary {
  session_id: string;
  phases: string;
  total_correct: number;
  total_questions: number;
  avg_reaction_time: number;
  created_at: string;
  attention_check_click: boolean | null;
}

const AdminPanel = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchSessionSummaries(phaseFilter);
    setSessions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [phaseFilter]);

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

  const exportToCSV = () => {
    if (sessions.length === 0) return;

    const headers = [
      "Session ID",
      "Phases",
      "Total Correct",
      "Total Questions",
      "Correct Rate (%)",
      "Avg Reaction Time (ms)",
      "Attention Check",
      "Created At",
    ];

    const rows = sessions.map((session) => [
      session.session_id,
      session.phases,
      session.total_correct,
      session.total_questions,
      Math.round((session.total_correct / session.total_questions) * 100),
      Math.round(session.avg_reaction_time),
      session.attention_check_click === null
        ? "N/A"
        : session.attention_check_click
        ? "Yes"
        : "No",
      session.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `experiment_results_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
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

            {/* Export Button */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              disabled={sessions.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
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
            <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Correct Rate</p>
            <p className="text-2xl font-bold text-primary">
              {sessions.length > 0
                ? `${Math.round(
                    (sessions.reduce((sum, s) => sum + s.total_correct, 0) /
                      sessions.reduce((sum, s) => sum + s.total_questions, 0)) *
                      100
                  )}%`
                : '0%'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Avg Reaction Time</p>
            <p className="text-2xl font-bold text-foreground">
              {sessions.length > 0
                ? formatReactionTime(
                    sessions.reduce((sum, s) => sum + s.avg_reaction_time, 0) /
                      sessions.length
                  )
                : '0s'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Attention Check Pass</p>
            <p className="text-2xl font-bold text-foreground">
              {sessions.filter((s) => s.attention_check_click === true).length}/
              {sessions.filter((s) => s.attention_check_click !== null).length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Phases</TableHead>
                <TableHead className="text-center">Total Correct</TableHead>
                <TableHead className="text-center">Avg Reaction Time</TableHead>
                <TableHead className="text-center">Attention Check</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell className="font-mono text-xs">
                      {session.session_id.slice(0, 8)}...
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
                  </TableRow>
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
