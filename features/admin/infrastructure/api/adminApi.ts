import { httpClient } from "@/infrastructure/http/httpClient"
import type { AdminStats } from "../../domain/model/adminStats"

export const adminApi = {
    getStats: async (): Promise<AdminStats> => {
        const res = await httpClient.get("/admin/dashboard/stats")
        return res.json()
    },
}
