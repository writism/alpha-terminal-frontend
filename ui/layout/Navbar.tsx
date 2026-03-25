"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { navbarStyles } from "./navbar.styles"

export default function Navbar() {
    const { state, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isLoggedIn = state.status === "AUTHENTICATED"
    const isLoading = state.status === "LOADING" || state.status === "PENDING_TERMS"

    const menuItemClass = (href: string) =>
        `${navbarStyles.menuItem.base} ${pathname === href ? navbarStyles.menuItem.active : navbarStyles.menuItem.inactive}`

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    return (
        <nav className={navbarStyles.nav}>
            <div className={navbarStyles.logo}>
                <Link href="/">Alpha Desk</Link>
            </div>

            <div className={navbarStyles.menuList}>
                <Link href="/" className={menuItemClass("/")}>Home</Link>

                {isLoggedIn && (
                    <>
                        <Link href="/dashboard" className={menuItemClass("/dashboard")}>Dashboard</Link>
                        <Link href="/watchlist" className={menuItemClass("/watchlist")}>Watchlist</Link>
                    </>
                )}

                {!isLoading && (
                    isLoggedIn ? (
                        <>
                            {state.status === "AUTHENTICATED" && (
                                <span className="text-sm text-gray-300">{state.user.nickname}</span>
                            )}
                            <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={navbarStyles.loginButton}>
                            Login
                        </Link>
                    )
                )}
            </div>
        </nav>
    )
}
