"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users, AlertTriangle, LogIn, User, Lock } from "lucide-react"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const OFFICE_SPOTS = Array.from({ length: 32 }, (_, i) => i + 1)

// Define seat groups
const SEAT_GROUPS = [
  { name: "Entrance", seats: [1, 2, 3, 4], label: "Entrance" },
  { name: "Group 2", seats: [5, 6, 7, 8, 9, 10, 11], label: "Group 2" },
  { name: "Group 3", seats: [12, 13, 14, 15, 16, 17, 18], label: "Group 3" },
  { name: "Group 4", seats: [19, 20, 21, 22, 23, 24, 25], label: "Group 4" },
  { name: "Group 5", seats: [26, 27, 28, 29, 30, 31, 32], label: "Group 5" },
]

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
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [currentUser, setCurrentUser] = useState("")

  // Existing states
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [bookings, setBookings] = useState<BookingData>({})
  const [lunchCounters, setLunchCounters] = useState<LunchCounters>({})
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [employeeName, setEmployeeName] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const TEAMS = [
    { value: "product", label: "Product", color: "bg-blue-500 border-blue-600" },
    { value: "data-science", label: "Data Science", color: "bg-purple-500 border-purple-600" },
    { value: "hr", label: "HR", color: "bg-orange-500 border-orange-600" },
  ]

  const handleLogin = () => {
    // Simple fake login - accept any username/password combination
    if (loginUsername.trim() && loginPassword.trim()) {
      setIsLoggedIn(true)
      setCurrentUser(loginUsername.trim())
      setLoginError("")
      setEmployeeName(loginUsername.trim()) // Pre-fill the booking form with logged-in user
    } else {
      setLoginError("Please enter both username and password")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser("")
    setLoginUsername("")
    setLoginPassword("")
    setEmployeeName("")
  }

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

  const getSeatLabel = (seatNumber: number) => {
    const group = SEAT_GROUPS.find((group) => group.seats.includes(seatNumber))
    return group?.label || ""
  }

  const handleSeatClick = (seatNumber: number) => {
    if (isSeatTaken(selectedDay, seatNumber)) {
      return // Can't book taken seats
    }
    setSelectedSeat(seatNumber)
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
    } else {
      // Show success message for future bookings
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 3000)
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

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <LogIn className="h-8 w-8" />
              Office Login
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to access seat booking</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <Button onClick={handleLogin} className="w-full" disabled={!loginUsername.trim() || !loginPassword.trim()}>
              Sign In
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Demo: Use any username and password to login</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main Booking Page (existing code)
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Logout */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-between items-center">
              <div></div>
              <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Calendar className="h-8 w-8" />
                Office Seat Booking
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Welcome, {currentUser}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
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

        {/* Success Alert for future bookings */}
        {showSuccessAlert && (
          <Alert className="border-green-200 bg-green-50">
            <AlertTriangle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Seat booked successfully! Your lunch has been reserved.
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

        {/* Office Layout - Grouped */}
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
          <CardContent className="space-y-6">
            {SEAT_GROUPS.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  {group.name} ({group.seats.length} seats)
                </h3>
                <div className={`grid gap-3 ${group.seats.length === 4 ? "grid-cols-4" : "grid-cols-7"}`}>
                  {group.seats.map((spotNumber) => {
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
                        {group.name === "Entrance" && <div className="text-xs text-center">Entrance</div>}
                        {isTaken && <div className="text-xs mt-1 break-words leading-tight">{owner}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
