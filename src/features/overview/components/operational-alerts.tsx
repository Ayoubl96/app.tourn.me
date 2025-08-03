'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OperationalDashboard } from '@/api/dashboard';
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface OperationalAlertsProps {
  data: OperationalDashboard;
}

export function OperationalAlerts({ data }: OperationalAlertsProps) {
  const hasAlerts =
    data.system_alerts.court_conflicts > 0 ||
    data.system_alerts.incomplete_matches > 0 ||
    data.system_alerts.upcoming_deadlines > 0;

  return (
    <div className='space-y-4'>
      {/* System Alerts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {hasAlerts ? (
              <AlertTriangle className='h-5 w-5 text-amber-600' />
            ) : (
              <CheckCircle2 className='h-5 w-5 text-green-600' />
            )}
            System Status
          </CardTitle>
          <CardDescription>
            Current system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-amber-600'>
                {data.system_alerts.court_conflicts}
              </div>
              <div className='text-xs text-muted-foreground'>
                Court Conflicts
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {data.system_alerts.incomplete_matches}
              </div>
              <div className='text-xs text-muted-foreground'>
                Incomplete Matches
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {data.system_alerts.upcoming_deadlines}
              </div>
              <div className='text-xs text-muted-foreground'>
                Upcoming Deadlines
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {data.system_alerts.matches_next_24h}
              </div>
              <div className='text-xs text-muted-foreground'>
                Next 24h Matches
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Court Conflicts */}
      {data.court_conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-amber-600'>
              <AlertTriangle className='h-5 w-5' />
              Court Conflicts
            </CardTitle>
            <CardDescription>
              Courts with scheduling conflicts that need attention
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {data.court_conflicts.map((conflict) => (
              <Alert key={conflict.court_name} className='border-amber-200'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  <strong>{conflict.court_name}</strong> has{' '}
                  {conflict.conflict_matches.length} overlapping matches:
                  <div className='mt-2 space-y-1'>
                    {conflict.conflict_matches.map((match) => (
                      <div
                        key={match.match_id}
                        className='text-sm text-muted-foreground'
                      >
                        • {match.tournament} -{' '}
                        {new Date(match.start_time).toLocaleTimeString()} to{' '}
                        {new Date(match.end_time).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Matches */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5 text-blue-600' />
            Upcoming Matches (24h)
          </CardTitle>
          <CardDescription>
            Matches scheduled for the next 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.upcoming_matches_24h.length === 0 ? (
            <div className='py-6 text-center text-muted-foreground'>
              No matches scheduled for the next 24 hours
            </div>
          ) : (
            <div className='space-y-3'>
              {data.upcoming_matches_24h.slice(0, 8).map((match) => (
                <div
                  key={match.match_id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>
                      {match.tournament_name}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {match.couple1_name} vs {match.couple2_name}
                    </div>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    {match.scheduled_start && (
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {new Date(match.scheduled_start).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )}
                      </div>
                    )}
                    {match.court_name && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {match.court_name}
                      </div>
                    )}
                    {!match.court_name && (
                      <Badge variant='outline'>No Court</Badge>
                    )}
                  </div>
                </div>
              ))}
              {data.upcoming_matches_24h.length > 8 && (
                <div className='text-center text-sm text-muted-foreground'>
                  ... and {data.upcoming_matches_24h.length - 8} more matches
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Deadlines */}
      {data.tournament_deadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='h-5 w-5' />
              Tournament Deadlines
            </CardTitle>
            <CardDescription>
              Tournaments approaching their end dates
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {data.tournament_deadlines.map((deadline) => (
              <div
                key={deadline.tournament_id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <div className='font-medium'>{deadline.tournament_name}</div>
                  <div className='text-sm text-muted-foreground'>
                    Ends on {new Date(deadline.end_date).toLocaleDateString()}
                  </div>
                </div>
                <Badge
                  variant={
                    deadline.days_remaining <= 3 ? 'destructive' : 'secondary'
                  }
                >
                  {deadline.days_remaining} days left
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
