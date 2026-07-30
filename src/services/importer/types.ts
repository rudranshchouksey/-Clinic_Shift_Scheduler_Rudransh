export type RejectedRow = {
  row: Record<string, string>
  reason: string
}

export type MergedRow = {
  row: Record<string, string>
  reason: string
}

export type ImportStatistics = {
  total: number
  accepted: number
  rejected: number
  merged: number
}

export type ImportResult<T> = {
  accepted: T[]
  rejected: RejectedRow[]
  merged: MergedRow[]
  statistics: ImportStatistics
}

export interface RawStaffRow {
  staff_id: string
  full_name: string
  role: string
  email: string
}

export interface RawShiftRow {
  shift_id: string
  date: string
  start_time: string
  end_time: string
  requirements: string
}
