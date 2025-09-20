"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addTeamMember, getTeamMembers, deleteTeamMember, type TeamMember } from "@/lib/firestore"
import { Plus, Users, Trash2, Calendar, User } from "lucide-react"

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [newMemberName, setNewMemberName] = useState("")
  const [addingMember, setAddingMember] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    setLoading(true)
    try {
      const membersData = await getTeamMembers()
      setTeamMembers(membersData)
    } catch (error) {
      console.error("Error loading team members:", error)
      setError("Failed to load team members")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim()) return

    setAddingMember(true)
    setError("")
    setSuccess("")

    try {
      await addTeamMember(newMemberName.trim())
      setNewMemberName("")
      setSuccess("Team member added successfully!")
      setIsDialogOpen(false)
      loadTeamMembers()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setAddingMember(false)
    }
  }

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteTeamMember(id)
        setSuccess("Team member deleted successfully!")
        loadTeamMembers()

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } catch (error: any) {
        setError(error.message)
      }
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Team Management
          </h2>
          <p className="text-muted-foreground mt-1">Add and manage your team members</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>Enter the name of the new team member you want to add.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberName">Team Member Name</Label>
                <Input
                  id="memberName"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter team member name"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addingMember}>
                  {addingMember ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Team Members ({teamMembers.length})</span>
            <Badge variant="secondary">{teamMembers.length} total</Badge>
          </CardTitle>
          <CardDescription>Manage your team roster</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No team members yet</p>
              <p>Add your first team member to get started with recurring sales tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member Name</TableHead>
                    <TableHead className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created Date
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {member.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(member.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
