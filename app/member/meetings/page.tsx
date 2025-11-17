'use client'

import { Calendar, CheckCircle2, Clock, MapPin, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'

type MeetingType = 'REGULAR' | 'SPECIAL' | 'ONE_ON_ONE'
type MeetingStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'

interface Meeting {
  id: string
  title: string
  description?: string
  meetingDate: string
  location?: string
  type: MeetingType
  status: MeetingStatus
  creator: {
    id: string
    name: string
    email: string
  }
  attendances: Array<{
    id: string
    status: AttendanceStatus
    checkedInAt?: string
    member: {
      id: string
      name: string
    }
  }>
}

const meetingTypeLabels = {
  REGULAR: 'Regular',
  SPECIAL: 'Especial',
  ONE_ON_ONE: '1-a-1',
}

const statusColors = {
  SCHEDULED: 'bg-blue-500',
  ONGOING: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
}

const statusLabels = {
  SCHEDULED: 'Agendada',
  ONGOING: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const router = useRouter()

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar usuário')
      }

      const data = await response.json()
      setCurrentUserId(data.user.id)
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    }
  }, [])

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch('/api/meetings?upcoming=true', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar reuniões')
      }

      const data = await response.json()
      setMeetings(data)
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error)
      toast.error('Erro ao carregar reuniões')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCurrentUser()
    fetchMeetings()
  }, [fetchCurrentUser, fetchMeetings])

  const handleAttendanceUpdate = async (meetingId: string, status: AttendanceStatus) => {
    setActionLoading(meetingId)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar presença')
      }

      const messages: Record<string, string> = {
        PRESENT: 'Presença confirmada com sucesso!',
        EXCUSED: 'Ausência justificada com sucesso!',
        LATE: 'Check-in registrado (atrasado)',
        ABSENT: 'Status atualizado',
      }

      toast.success(messages[status] || 'Presença atualizada!')
      await fetchMeetings()
    } catch (error) {
      console.error('Erro ao atualizar presença:', error)
      toast.error('Erro ao atualizar presença')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCheckIn = async (meetingId: string, meetingDate: Date) => {
    const now = new Date()
    const minutesAfterStart = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60))

    // Se passou mais de 10 minutos, marca como atrasado
    const status = minutesAfterStart > 10 ? 'LATE' : 'PRESENT'

    await handleAttendanceUpdate(meetingId, status)
  }

  const getUserAttendance = (meeting: Meeting) => {
    return meeting.attendances.find((a) => a.member.id === currentUserId)
  }

  const canDoCheckIn = (meetingDate: Date) => {
    const now = new Date()
    const minutesAfterStart = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60))

    // Pode fazer check-in no horário ou até 10 minutos depois
    return now >= meetingDate && minutesAfterStart <= 10
  }

  const isLateCheckIn = (meetingDate: Date) => {
    const now = new Date()
    const minutesAfterStart = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60))

    // Está atrasado se passou mais de 10 minutos
    return now >= meetingDate && minutesAfterStart > 10
  }

  if (loading) {
    return <LoadingState message="Carregando reuniões..." />
  }

  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'SCHEDULED' || m.status === 'ONGOING'
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reuniões</h1>
        <p className="text-muted-foreground">Próximas reuniões do grupo e check-in de presença</p>
      </div>

      {upcomingMeetings.length === 0 ? (
        <EmptyState
          title="Nenhuma reunião agendada"
          description="Não há reuniões programadas no momento."
          icon="inbox"
        />
      ) : (
        <div className="grid gap-6">
          {upcomingMeetings.map((meeting) => {
            const meetingDate = new Date(meeting.meetingDate)
            const userAttendance = getUserAttendance(meeting)
            const hasConfirmed = userAttendance?.status === 'PRESENT'
            const hasExcused = userAttendance?.status === 'EXCUSED'
            const hasLate = userAttendance?.status === 'LATE'
            const hasCheckedIn = hasConfirmed || hasLate

            const canCheckInNow = canDoCheckIn(meetingDate)
            const isLate = isLateCheckIn(meetingDate)

            return (
              <Card key={meeting.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[meeting.status]}>
                          {statusLabels[meeting.status]}
                        </Badge>
                        <Badge variant="outline">{meetingTypeLabels[meeting.type]}</Badge>
                      </div>
                      <CardTitle className="text-xl">{meeting.title}</CardTitle>
                      {meeting.description && (
                        <CardDescription className="mt-1">{meeting.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {meetingDate.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {meetingDate.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {meeting.attendances.filter((a) => a.status === 'PRESENT').length}{' '}
                        confirmados
                      </span>
                    </div>
                  </div>

                  {/* Botões de ação baseados no status */}
                  <div className="space-y-2">
                    {hasConfirmed && !hasLate && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          Presença confirmada
                        </span>
                      </div>
                    )}

                    {hasLate && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <CheckCircle2 className="h-5 w-5 text-orange-600" />
                        <span className="text-sm text-orange-700 font-medium">
                          Check-in realizado (atrasado)
                        </span>
                      </div>
                    )}

                    {hasExcused && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-sm text-yellow-700 font-medium">
                          Ausência justificada
                        </span>
                      </div>
                    )}

                    {/* Botão de Confirmar Presença (antecipadamente) */}
                    {!hasCheckedIn && !hasExcused && !canCheckInNow && (
                      <Button
                        onClick={() => handleAttendanceUpdate(meeting.id, 'PRESENT')}
                        disabled={actionLoading === meeting.id}
                        className="w-full"
                      >
                        {actionLoading === meeting.id ? (
                          'Processando...'
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar Presença
                          </>
                        )}
                      </Button>
                    )}

                    {/* Botão de Check-in (no horário) */}
                    {!hasCheckedIn && !hasExcused && canCheckInNow && (
                      <Button
                        onClick={() => handleCheckIn(meeting.id, meetingDate)}
                        disabled={actionLoading === meeting.id}
                        className="w-full"
                      >
                        {actionLoading === meeting.id ? (
                          'Processando...'
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Fazer Check-in
                          </>
                        )}
                      </Button>
                    )}

                    {/* Botão de Check-in (atrasado) */}
                    {!hasCheckedIn && !hasExcused && isLate && !canCheckInNow && (
                      <Button
                        onClick={() => handleCheckIn(meeting.id, meetingDate)}
                        disabled={actionLoading === meeting.id}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        {actionLoading === meeting.id ? (
                          'Processando...'
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Fazer Check-in (Atrasado)
                          </>
                        )}
                      </Button>
                    )}

                    {/* Reverter justificativa para Confirmar Presença */}
                    {hasExcused && (
                      <Button
                        onClick={() => handleAttendanceUpdate(meeting.id, 'PRESENT')}
                        disabled={actionLoading === meeting.id}
                        variant="outline"
                        className="w-full"
                      >
                        {actionLoading === meeting.id ? 'Processando...' : 'Confirmar Presença'}
                      </Button>
                    )}

                    {/* Botão Justificar Ausência (sempre disponível se não justificou) */}
                    {!hasExcused && (
                      <Button
                        onClick={() => handleAttendanceUpdate(meeting.id, 'EXCUSED')}
                        disabled={actionLoading === meeting.id}
                        variant="outline"
                        className="w-full"
                      >
                        {actionLoading === meeting.id ? 'Processando...' : 'Justificar Ausência'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
