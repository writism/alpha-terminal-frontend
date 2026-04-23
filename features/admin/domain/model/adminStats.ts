export interface RetentionPoint {
    day: number
    rate: number
}

export interface AdminStats {
    total_users: number
    new_users_today: number
    new_users_this_week: number
    retention: RetentionPoint[]
    avg_dwell_time_seconds: number | null
    ctr: number | null
}
