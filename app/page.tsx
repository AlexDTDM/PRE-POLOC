"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users, AlertTriangle } from "lucide-react"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const OFFICE_SPOTS = Array.from({ length: 20 }, (_, i) => i + 1)

type BookingData = {
  [day: string]: {
    [seatNumber: number]: {
      employeeName: string
      team: string
    }
  }
}

type LunchCounters = {
  [day: string]: number
}

export default function SeatBookingApp() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [bookings, setBookings] = useState<BookingData>({})
  const [lunchCounters, setLunchCounters] = useState<LunchCounters>({})
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [employeeName, setEmployeeName] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState("")

  const TEAMS = [
    { value: "product", label: "Product", color: "bg-blue-500 border-blue-600" },
    { value: "data-science", label: "Data Science", color: "bg-purple-500 border-purple-600" },
    { value: "hr", label: "HR", color: "bg-orange-500 border-orange-600" },
  ]

  const getCurrentDay = () => {
    const today = new Date()
    return DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1] // Adjust for Sunday = 0
  }

  const getCurrentDateFormatted = () => {
    const today = new Date()
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isSeatTaken = (day: string, seatNumber: number) => {
    return bookings[day]?.[seatNumber] !== undefined
  }

  const getSeatOwner = (day: string, seatNumber: number) => {
    return bookings[day]?.[seatNumber]?.employeeName || ""
  }

  const getSeatTeam = (day: string, seatNumber: number) => {
    return bookings[day]?.[seatNumber]?.team || ""
  }

  const handleSeatClick = (seatNumber: number) => {
    if (isSeatTaken(selectedDay, seatNumber)) {
      return // Can't book taken seats
    }
    setSelectedSeat(seatNumber)
    setEmployeeName("")
    setSelectedTeam("")
    setShowDialog(true)
  }

  const handleBookSeat = () => {
    if (!selectedSeat || !employeeName.trim() || !selectedTeam) return

    const currentDay = getCurrentDay()
    const isBookingForToday = selectedDay === currentDay

    if (isBookingForToday) {
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 5000)
      // Still allow the booking to go through, just show the warning
    }

    // Update bookings (this now happens regardless of the day)
    setBookings((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedSeat]: {
          employeeName: employeeName.trim(),
          team: selectedTeam,
        },
      },
    }))

    // Only increment lunch counter if NOT booking for today
    if (!isBookingForToday) {
      setLunchCounters((prev) => ({
        ...prev,
        [selectedDay]: (prev[selectedDay] || 0) + 1,
      }))
    }

    setShowDialog(false)
    setSelectedSeat(null)
    setEmployeeName("")
    setSelectedTeam("")
  }

  const handleCancelBooking = (day: string, seatNumber: number) => {
    setBookings((prev) => {
      const newBookings = { ...prev }
      if (newBookings[day]) {
        delete newBookings[day][seatNumber]
        if (Object.keys(newBookings[day]).length === 0) {
          delete newBookings[day]
        }
      }
      return newBookings
    })

    // Decrement lunch counter
    setLunchCounters((prev) => ({
      ...prev,
      [day]: Math.max((prev[day] || 0) - 1, 0),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Calendar className="h-8 w-8" />
              Office Seat Booking
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Current Day Display */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-600">Today is</p>
              <p className="text-2xl font-semibold text-gray-800">{getCurrentDateFormatted()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Alert for Monday booking */}
        {showAlert && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Seat booked successfully! However, it's too late to reserve a meal for today.
            </AlertDescription>
          </Alert>
        )}

        {/* Day Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Select Day of the Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  onClick={() => setSelectedDay(day)}
                  className="w-full"
                >
                  {day}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Office Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              Office Spots - {selectedDay}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Data Science</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>HR</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {OFFICE_SPOTS.map((spotNumber) => {
                const isTaken = isSeatTaken(selectedDay, spotNumber)
                const owner = getSeatOwner(selectedDay, spotNumber)
                const team = getSeatTeam(selectedDay, spotNumber)
                const teamConfig = TEAMS.find((t) => t.value === team)

                return (
                  <div
                    key={spotNumber}
                    className={`
                      relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-2 text-center text-white
                      ${
                        isTaken
                          ? `${teamConfig?.color || "bg-red-500 border-red-600"} hover:opacity-90`
                          : "bg-green-500 border-green-600 hover:bg-green-600 hover:scale-105"
                      }
                    `}
                    onClick={() =>
                      isTaken ? handleCancelBooking(selectedDay, spotNumber) : handleSeatClick(spotNumber)
                    }
                  >
                    <div className="font-bold text-lg">{spotNumber}</div>
                    {isTaken && <div className="text-xs mt-1 break-words leading-tight">{owner}</div>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lunch Counter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-2xl font-semibold">
              <Users className="h-6 w-6" />
              <span>Booked Lunches for {selectedDay}:</span>
              <Badge variant="secondary" className="text-xl px-3 py-1">
                {lunchCounters[selectedDay] || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Booking Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Book Seat {selectedSeat} for {selectedDay}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input
                  id="employee-name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyDown={(e) => e.key === "Enter" && selectedTeam && handleBookSeat()}
                />
              </div>
              <div>
                <Label htmlFor="team-select">Team</Label>
                <select
                  id="team-select"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select your team</option>
                  {TEAMS.map((team) => (
                    <option key={team.value} value={team.value}>
                      {team.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBookSeat} disabled={!employeeName.trim() || !selectedTeam}>
                  Book Seat
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
