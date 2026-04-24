export type UserRole = "student" | "employer"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface StudentProfile extends Profile {
  role: "student"
  cuny_school: string
  major: string
  skills: string[]
  bio: string
  portfolio_url?: string
  rating: number
  completed_projects: number
}

export interface EmployerProfile extends Profile {
  role: "employer"
  company_name: string
  website?: string
  verified: boolean
}

export type BriefStatus = "open" | "matched" | "in_progress" | "submitted" | "completed"

export interface Brief {
  id: string
  employer_id: string
  title: string
  description: string
  skills_required: string[]
  budget: number
  deadline: string
  status: BriefStatus
  created_at: string
  employer?: EmployerProfile
}

export interface Match {
  id: string
  brief_id: string
  student_id: string
  status: "pending" | "accepted" | "rejected"
  ai_score: number
  created_at: string
  brief?: Brief
  student?: StudentProfile
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  is_ai_suggestion: boolean
  created_at: string
}

export interface Submission {
  id: string
  match_id: string
  brief_id: string
  student_id: string
  file_urls: string[]
  video_asset_id?: string
  notes: string
  status: "pending" | "approved" | "revision_requested"
  submitted_at: string
}

export interface Review {
  id: string
  submission_id: string
  employer_id: string
  student_id: string
  rating: number
  comment: string
  created_at: string
}

export interface PortfolioItem {
  id: string
  student_id: string
  brief_id: string
  title: string
  description: string
  skills: string[]
  rating: number
  employer_name: string
  completed_at: string
  thumbnail_url?: string
}
