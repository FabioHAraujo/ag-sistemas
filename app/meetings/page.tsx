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
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const router = useRouter()

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
    fetchMeetings()
  }, [fetchMeetings])

  const handleCheckIn = async (meetingId: string) => {
    setCheckingIn(meetingId)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PRESENT',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer check-in')
      }

      toast.success('Check-in realizado com sucesso!')
      await fetchMeetings()
    } catch (error) {
      console.error('Erro ao fazer check-in:', error)
      toast.error('Erro ao fazer check-in')
    } finally {
      setCheckingIn(null)
    }
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
            const isToday = meetingDate.toDateString() === new Date().toDateString()
            const canCheckIn = isToday && meeting.status !== 'CANCELLED'

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

                  {canCheckIn && (
                    <Button
                      onClick={() => handleCheckIn(meeting.id)}
                      disabled={checkingIn === meeting.id}
                      className="w-full"
                    >
                      {checkingIn === meeting.id ? (
                        'Fazendo check-in...'
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Fazer Check-in
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
