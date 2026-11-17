'use client'

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import AdminDropdown from "@/components/admin/AdminDropdown"
import {
    SearchIcon,
    CloseIcon,
    RefreshIcon,
    CheckIcon,
    LockIcon,
    ShieldCheckIcon,
    UserIcon,
    UsersIcon,
    UserCheckIcon,
    BanIcon,
    TrashIcon,
    AlertCircleIcon
} from "@/components/icons"

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Admin (Full Access)', dot: 'bg-[#6C306E]' },
    { value: 'EMPLOYEE', label: 'Employee (Staff)', dot: 'bg-blue-600' },
    { value: 'CUSTOMER', label: 'Customer', dot: 'bg-slate-400' },
]

const MODULE_PERMISSIONS = [
    { id: 'analytics', name: 'Views & Analytics', description: 'View visitor analytics and revenue sales charts' },
    { id: 'products', name: 'Products & Stock', description: 'Add, update products, modify prices and stock counts' },
    { id: 'categories', name: 'Category Catalog', description: 'Manage shop categories and collections' },
    { id: 'homepage', name: 'Homepage Showcase', description: 'Curate best selling and new arrival product placements' },
    { id: 'banners', name: 'Hero Banner Slider', description: 'Upload, reorder, and activate homepage hero banners' },
    { id: 'promotions', name: 'Hero Promo Cards', description: 'Configure top promotional offer cards' },
    { id: 'orders', name: 'Customer Orders', description: 'View, fulfill, update status and assign couriers' },
    { id: 'customers', name: 'Customer Intelligence', description: 'View registered customers and purchase histories' },
    { id: 'inquiries', name: 'Customer Inquiries', description: 'Respond to and resolve customer contact inquiries' },
]

export default function AdminTeamPage() {
    // 1. Instant Cache-First State: Load from sessionStorage in 0ms if available
    const [teamMembers, setTeamMembers] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = sessionStorage.getItem('ukbl_team_cache_users')
                if (cached) return JSON.parse(cached)
            } catch {}
        }
        return []
    })

    const [stats, setStats] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = sessionStorage.getItem('ukbl_team_cache_stats')
                if (cached) return JSON.parse(cached)
            } catch {}
        }
        return {
            totalUsers: 0,
            totalRegistrations: 0,
            totalStaff: 0,
            totalAdmins: 0,
            totalEmployees: 0,
            totalCustomers: 0,
            totalBlocked: 0,
            activeUsers: 0,
            activeStaff: 0,
        }
    })

    // If cache already exists, never block the screen with a spinner!
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = sessionStorage.getItem('ukbl_team_cache_users')
                if (cached && JSON.parse(cached).length > 0) return false
            } catch {}
        }
        return true
    })

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTab, setFilterTab] = useState('all') // 'all' | 'staff' | 'admins' | 'employees' | 'customers' | 'active' | 'blocked'
    const [actionLoadingId, setActionLoadingId] = useState(null)

    // Current logged-in user from localStorage to prevent self-lockout
    const [currentUser, setCurrentUser] = useState(null)

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        user: null,
        loading: false,
    })

    // Granular Permissions Modal State
    const [permModal, setPermModal] = useState({
        isOpen: false,
        user: null,
        permissions: [],
        loading: false,
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) setCurrentUser(JSON.parse(saved))
            } catch {}
        }
    }, [])

    // Ultra-Fast Parallel Fetch: Loads all registered users at once
    const fetchTeam = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) setIsRefreshing(true)
            if (teamMembers.length === 0) setLoading(true)

            const res = await fetch('/api/admin/team', { cache: 'no-store' })
            const data = await res.json()

            if (data.success && Array.isArray(data.users)) {
                setTeamMembers(data.users)
                if (data.stats) setStats(data.stats)

                // Cache in sessionStorage for instant 0ms subsequent loads
                if (typeof window !== 'undefined') {
                    try {
                        sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(data.users))
                        if (data.stats) sessionStorage.setItem('ukbl_team_cache_stats', JSON.stringify(data.stats))
                    } catch {}
                }
            }
        } catch (error) {
            console.error('Error fetching team members:', error)
            if (teamMembers.length === 0) toast.error('Failed to load team data')
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    // Immediate mount fetch with ZERO artificial delay
    useEffect(() => {
        fetchTeam()
    }, [])

    // Instant 0ms Filter Tab Switch
    const handleTabChange = (tabId) => {
        setFilterTab(tabId)
    }

    // Instant Client-Side 0ms Dynamic Filtering for Tabs & Search
    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()

        return teamMembers.filter(user => {
            // 1. Role & Status Tab Filter
            if (filterTab === 'staff') {
                if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') return false
            } else if (filterTab === 'admins') {
                if (user.role !== 'ADMIN') return false
            } else if (filterTab === 'employees') {
                if (user.role !== 'EMPLOYEE') return false
            } else if (filterTab === 'customers') {
                if (user.role !== 'CUSTOMER') return false
            } else if (filterTab === 'active') {
                if (!user.isActive) return false
            } else if (filterTab === 'blocked') {
                if (user.isActive) return false
            }

            // 2. Real-Time Search Match across name, email, phone, whatsapp
            if (q) {
                const nameMatch = user.name?.toLowerCase().includes(q)
                const emailMatch = user.email?.toLowerCase().includes(q)
                const phoneMatch = user.phone?.includes(q)
                const whatsappMatch = user.whatsapp?.includes(q)
                return Boolean(nameMatch || emailMatch || phoneMatch || whatsappMatch)
            }

            return true
        })
    }, [teamMembers, filterTab, searchQuery])

    // Live Dynamic Stats: instantly computes from in-memory teamMembers
    const liveStats = useMemo(() => {
        if (!teamMembers || teamMembers.length === 0) {
            return stats
        }

        let totalAdmins = 0
        let totalEmployees = 0
        let totalCustomers = 0
        let totalBlocked = 0
        let activeUsers = 0

        for (let i = 0; i < teamMembers.length; i++) {
            const u = teamMembers[i]
            if (u.role === 'ADMIN') totalAdmins++
            else if (u.role === 'EMPLOYEE') totalEmployees++
            else if (u.role === 'CUSTOMER') totalCustomers++

            if (u.isActive) activeUsers++
            else totalBlocked++
        }

        const totalUsers = teamMembers.length
        const totalStaff = totalAdmins + totalEmployees

        return {
            totalUsers,
            totalRegistrations: totalUsers,
            totalStaff,
            totalAdmins,
            totalEmployees,
            totalCustomers,
            totalBlocked,
            activeUsers,
            activeStaff: activeUsers,
        }
    }, [teamMembers, stats])

    // Instant Role Change with Optimistic UI Reaction (0ms response)
    const handleRoleChange = async (user, newRole) => {
        if (!user || user.role === newRole) return

        const isSelf = currentUser && (
            currentUser.id === user.id ||
            currentUser.email?.toLowerCase() === user.email?.toLowerCase()
        )

        if (isSelf && newRole !== 'ADMIN') {
            toast.error('You cannot change your own Administrator account role.')
            return
        }

        const previousRole = user.role

        // 1. Instant Optimistic Reaction
        setTeamMembers(prev => {
            const updated = prev.map(m => m.id === user.id ? { ...m, role: newRole } : m)
            try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(updated)) } catch {}
            return updated
        })

        try {
            setActionLoadingId(user.id)
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user.id,
                    newRole: newRole,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                // Revert on failure
                setTeamMembers(prev => {
                    const reverted = prev.map(m => m.id === user.id ? { ...m, role: previousRole } : m)
                    try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(reverted)) } catch {}
                    return reverted
                })
                toast.error(data.message || 'Failed to update role')
                return
            }

            toast.success(`Role updated to ${newRole === 'ADMIN' ? 'Admin' : newRole === 'EMPLOYEE' ? 'Employee' : 'Customer'}`)
        } catch (error) {
            console.error('Error changing role:', error)
            setTeamMembers(prev => {
                const reverted = prev.map(m => m.id === user.id ? { ...m, role: previousRole } : m)
                try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(reverted)) } catch {}
                return reverted
            })
            toast.error('An error occurred while updating permissions')
        } finally {
            setActionLoadingId(null)
        }
    }

    // Instant Block / Unblock Toggle with Optimistic UI Reaction (0ms response)
    const handleToggleBlock = async (user) => {
        if (!user) return

        const isSelf = currentUser && (
            currentUser.id === user.id ||
            currentUser.email?.toLowerCase() === user.email?.toLowerCase()
        )

        if (isSelf) {
            toast.error('You cannot block your own account.')
            return
        }

        const newStatus = !user.isActive
        const previousStatus = user.isActive

        // 1. Instant Optimistic Reaction
        setTeamMembers(prev => {
            const updated = prev.map(m => m.id === user.id ? { ...m, isActive: newStatus } : m)
            try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(updated)) } catch {}
            return updated
        })

        try {
            setActionLoadingId(user.id)
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user.id,
                    isActive: newStatus,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                // Revert on failure
                setTeamMembers(prev => {
                    const reverted = prev.map(m => m.id === user.id ? { ...m, isActive: previousStatus } : m)
                    try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(reverted)) } catch {}
                    return reverted
                })
                toast.error(data.message || 'Failed to update account status')
                return
            }

            toast.success(newStatus ? `Unblocked ${user.name}` : `Blocked ${user.name}`)
        } catch (error) {
            console.error('Error toggling status:', error)
            setTeamMembers(prev => {
                const reverted = prev.map(m => m.id === user.id ? { ...m, isActive: previousStatus } : m)
                try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(reverted)) } catch {}
                return reverted
            })
            toast.error('An error occurred')
        } finally {
            setActionLoadingId(null)
        }
    }

    // Execute Delete Action with Instant Optimistic Removal
    const handleConfirmDelete = async () => {
        const user = deleteModal.user
        if (!user) return

        // 1. Instant Optimistic Removal
        setTeamMembers(prev => {
            const updated = prev.filter(m => m.id !== user.id)
            try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(updated)) } catch {}
            return updated
        })

        setDeleteModal({ isOpen: false, user: null, loading: false })

        try {
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user.id,
                    action: 'delete',
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to delete user')
                // Silently refresh list
                fetchTeam()
                return
            }

            toast.success(data.message || 'User deleted successfully')
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
            fetchTeam()
        }
    }

    // Open Permissions Modal for an Employee
    const handleOpenPermModal = (user) => {
        setPermModal({
            isOpen: true,
            user,
            permissions: Array.isArray(user.permissions) ? [...user.permissions] : [],
            loading: false,
        })
    }

    // Toggle specific module permission checkbox
    const handleTogglePerm = (permId) => {
        setPermModal(prev => {
            const current = prev.permissions || []
            const exists = current.includes(permId)
            const updated = exists ? current.filter(id => id !== permId) : [...current, permId]
            return { ...prev, permissions: updated }
        })
    }

    // Select or Deselect All Permissions
    const handleToggleAllPerms = () => {
        setPermModal(prev => {
            const allIds = MODULE_PERMISSIONS.map(m => m.id)
            const isAllSelected = allIds.every(id => (prev.permissions || []).includes(id))
            return {
                ...prev,
                permissions: isAllSelected ? [] : allIds
            }
        })
    }

    // Save Granular Permissions to Database
    const handleSavePermissions = async () => {
        const user = permModal.user
        if (!user) return

        const updatedPermissions = permModal.permissions || []

        // Optimistic UI update
        setTeamMembers(prev => {
            const updated = prev.map(m => m.id === user.id ? { ...m, permissions: updatedPermissions } : m)
            try { sessionStorage.setItem('ukbl_team_cache_users', JSON.stringify(updated)) } catch {}
            return updated
        })

        setPermModal(prev => ({ ...prev, loading: true }))

        try {
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user.id,
                    permissions: updatedPermissions,
                }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to update permissions')
                fetchTeam()
                return
            }

            toast.success(`Updated permissions for ${user.name}`)
            setPermModal({ isOpen: false, user: null, permissions: [], loading: false })
        } catch (error) {
            console.error('Error saving permissions:', error)
            toast.error('Failed to save permissions')
            fetchTeam()
        }
    }

    // Format ISO date to "Oct 16, 2026"
    const formatDate = (dateString) => {
        if (!dateString) return '—'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch {
            return '—'
        }
    }

    return (
        <div className="space-y-6">
            {/* 1. Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold select-none">
                <Link href="/admin" className="hover:text-[#6C306E] transition">Dashboard</Link>
                <span className="text-slate-400">›</span>
                <span className="text-[#6C306E] font-bold">Admin Panel</span>
            </div>

            {/* 2. Top Title & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                        Admin & Team Access Management
                    </h1>
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
                        Approve new employee sign-ups, grant admin privileges, or manage account restrictions
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchTeam(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:text-[#6C306E] text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <RefreshIcon size={14} className={isRefreshing ? "animate-spin text-[#6C306E]" : ""} />
                    <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* 3. Top 5 Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Card 1: Total Registered Users */}
                <div
                    onClick={() => handleTabChange('all')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between gap-3 ${
                        filterTab === 'all'
                            ? 'border-2 border-[#6C306E] ring-2 ring-[#6C306E]/10'
                            : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                            <UsersIcon size={20} color="#6C306E" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[#241224] leading-none">
                                {liveStats.totalRegistrations ?? liveStats.totalUsers ?? 0}
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-1">
                                Total Registrations
                            </div>
                        </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6C306E] text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                        ACTIVE
                    </span>
                </div>

                {/* Card 2: Full Administrators */}
                <div
                    onClick={() => handleTabChange('admins')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'admins'
                            ? 'border-2 border-[#6C306E] ring-2 ring-[#6C306E]/10'
                            : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                        <ShieldCheckIcon size={22} color="#6C306E" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {liveStats.totalAdmins || 0}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Full Administrators
                        </div>
                    </div>
                </div>

                {/* Card 3: Employees */}
                <div
                    onClick={() => handleTabChange('employees')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'employees'
                            ? 'border-2 border-blue-600 ring-2 ring-blue-600/10'
                            : 'border-[#EFE0EF] hover:border-blue-300'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                        <UserCheckIcon size={20} color="#2563EB" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {liveStats.totalEmployees || 0}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Employees (Staff)
                        </div>
                    </div>
                </div>

                {/* Card 4: Customer Accounts */}
                <div
                    onClick={() => handleTabChange('customers')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'customers'
                            ? 'border-2 border-slate-700 ring-2 ring-slate-700/10'
                            : 'border-[#EFE0EF] hover:border-slate-300'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <UserIcon size={20} color="#475569" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {liveStats.totalCustomers || 0}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Customer Accounts
                        </div>
                    </div>
                </div>

                {/* Card 5: Blocked Accounts */}
                <div
                    onClick={() => handleTabChange('blocked')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'blocked'
                            ? 'border-2 border-rose-600 ring-2 ring-rose-600/10'
                            : 'border-[#EFE0EF] hover:border-rose-300'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 shrink-0">
                        <BanIcon size={20} color="#E11D48" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {liveStats.totalBlocked || 0}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Blocked / Restricted
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Filter Tabs Row (Instant 0ms In-Memory Tab Switch) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'all', label: 'All Users', count: liveStats.totalRegistrations ?? liveStats.totalUsers ?? 0 },
                    { id: 'staff', label: 'All Staff', count: liveStats.totalStaff || 0 },
                    { id: 'admins', label: 'Administrators', count: liveStats.totalAdmins || 0 },
                    { id: 'employees', label: 'Employees', count: liveStats.totalEmployees || 0 },
                    { id: 'customers', label: 'Customers', count: liveStats.totalCustomers || 0 },
                    { id: 'active', label: 'Active', count: liveStats.activeUsers || 0 },
                    { id: 'blocked', label: 'Blocked', count: liveStats.totalBlocked || 0 },
                ].map(tab => {
                    const isActive = filterTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
                            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap shadow-2xs ${
                                isActive
                                    ? 'bg-[#FAF6FA] border-2 border-[#6C306E] text-[#6C306E]'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#6C306E]/40 hover:text-[#6C306E]'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`size-5 rounded-full text-[10.5px] font-black flex items-center justify-center leading-none ${
                                    isActive
                                        ? 'bg-[#6C306E] text-white'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* 5. Clean Search Bar (Instant 0ms Dynamic Filtering) */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon size={17} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search user accounts by name or email..."
                    className="w-full h-11 pl-11 pr-10 rounded-2xl bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 focus:border-[#6C306E] focus:ring-3 focus:ring-[#6C306E]/10 text-xs sm:text-[13px] font-medium text-[#241224] placeholder-slate-400 transition outline-none shadow-2xs"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <CloseIcon size={14} />
                    </button>
                )}
            </div>

            {/* Live Search Notice */}
            {Boolean(searchQuery.trim()) && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#6C306E] animate-pulse" />
                        <span>Showing filtered search results for &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                        {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} found
                    </span>
                </div>
            )}

            {/* 6. Main Team & Access Management Table */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xs overflow-hidden min-h-[340px]">
                {loading && teamMembers.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loading />
                        <span className="text-xs text-slate-500 font-semibold mt-3">
                            Loading access management records...
                        </span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-16 text-center px-4">
                        <div className="size-14 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mx-auto mb-3">
                            <UsersIcon size={24} color="#6C306E" />
                        </div>
                        <h4 className="text-sm font-bold text-[#241224]">No records found</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            {searchQuery
                                ? `No user accounts matched "${searchQuery}". Try searching by a different name or email.`
                                : `No users currently match the selected filter tab (${filterTab}).`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[320px]">
                        <table className="w-full text-left border-collapse">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-[#FAF6FA]/90 border-b border-[#EFE0EF] text-[11px] font-black uppercase tracking-wider text-slate-500 select-none">
                                    <th className="py-3.5 px-5 sm:px-6">USER / IDENTIFICATION</th>
                                    <th className="py-3.5 px-4">ASSIGNED ROLE</th>
                                    <th className="py-3.5 px-4">ACCESS STATUS</th>
                                    <th className="py-3.5 px-4">JOINED DATE</th>
                                    <th className="py-3.5 px-5 sm:px-6 text-left">MANAGEMENT ACTIONS</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="divide-y divide-[#EFE0EF]/70">
                                {filteredUsers.map((user) => {
                                    const isSelf = currentUser && (
                                        currentUser.id === user.id ||
                                        currentUser.email?.toLowerCase() === user.email?.toLowerCase()
                                    )
                                    const isAdmin = user.role === 'ADMIN'
                                    const isEmployee = user.role === 'EMPLOYEE'
                                    const isBlocked = user.isActive === false
                                    const isUpdating = actionLoadingId === user.id

                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-[#FAF6FA]/40 transition-colors duration-150"
                                        >
                                            {/* Column 1: User / Identification */}
                                            <td className="py-4 px-5 sm:px-6 align-middle">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-extrabold text-xs sm:text-[13px] text-[#241224] uppercase tracking-wide">
                                                        {user.name || 'Unnamed User'}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] text-[10px] font-black tracking-wide">
                                                            You (Owner)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 font-normal mt-0.5 truncate max-w-xs">
                                                    {user.email}
                                                </div>
                                            </td>

                                            {/* Column 2: Assigned Role */}
                                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                                                {isAdmin ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] text-xs font-bold shadow-2xs">
                                                        <ShieldCheckIcon size={14} color="#6C306E" />
                                                        <span>Admin (Full Access)</span>
                                                    </span>
                                                ) : isEmployee ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs">
                                                            <UserCheckIcon size={14} color="#1D4ED8" />
                                                            <span>Employee (Staff)</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPermModal(user)}
                                                            className="text-[11px] font-bold text-[#6C306E] hover:underline flex items-center gap-1 cursor-pointer pl-1"
                                                        >
                                                            <span>{(user.permissions || []).length} Modules Permitted</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold shadow-2xs">
                                                        <UserIcon size={14} color="#475569" />
                                                        <span>Customer</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column 3: Access Status (Direct Active vs Blocked status) */}
                                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                                                {isBlocked ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                                                        <span className="size-1.5 rounded-full bg-rose-500" />
                                                        <span>Blocked</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        <span>Active</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column 4: Joined Date */}
                                            <td className="py-4 px-4 align-middle whitespace-nowrap text-xs text-slate-600 font-medium">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            {/* Column 5: Management Actions (Role Dropdown + Block + Delete) */}
                                            <td className="py-4 px-5 sm:px-6 align-middle">
                                                <div className="flex items-center gap-2.5">
                                                    {/* 1. Sleek Role Dropdown */}
                                                    <div className="w-48 shrink-0">
                                                        {isSelf ? (
                                                            <div className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold flex items-center justify-between cursor-not-allowed select-none shadow-2xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="size-2 rounded-full bg-[#6C306E]" />
                                                                    <span>Admin (Owner)</span>
                                                                </div>
                                                                <LockIcon size={12} color="#94A3B8" />
                                                            </div>
                                                        ) : (
                                                            <AdminDropdown
                                                                value={user.role}
                                                                onChange={(newRole) => handleRoleChange(user, newRole)}
                                                                options={ROLE_OPTIONS}
                                                                placeholder="Select Role"
                                                                buttonClassName="h-9 bg-white hover:bg-[#FAF6FA] border-[#EFE0EF] hover:border-[#6C306E]/40 text-xs font-bold text-[#241224] rounded-xl shadow-2xs"
                                                                menuClassName="w-52 shadow-xl border-[#EFE0EF] rounded-xl"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Permissions Configure Button (For Employee) */}
                                                    {isEmployee && (
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() => handleOpenPermModal(user)}
                                                            title="Configure Module Permissions"
                                                            className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E] bg-white hover:bg-[#FAF6FA] text-[#6C306E] text-xs font-bold transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                                                        >
                                                            <span>Permissions</span>
                                                        </button>
                                                    )}

                                                    {/* 2. Block / Unblock Button */}
                                                    {!isSelf ? (
                                                        isBlocked ? (
                                                            <button
                                                                type="button"
                                                                disabled={isUpdating}
                                                                onClick={() => handleToggleBlock(user)}
                                                                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                                                            >
                                                                <CheckIcon size={13} color="#059669" />
                                                                <span>Unblock</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={isUpdating}
                                                                onClick={() => handleToggleBlock(user)}
                                                                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                                                            >
                                                                <BanIcon size={13} color="#E11D48" />
                                                                <span>Block</span>
                                                            </button>
                                                        )
                                                    ) : (
                                                        <span className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold flex items-center justify-center select-none shrink-0 shadow-2xs">
                                                            Protected
                                                        </span>
                                                    )}

                                                    {/* 3. Delete User Button */}
                                                    {!isSelf && (
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating}
                                                            onClick={() => setDeleteModal({ isOpen: true, user, loading: false })}
                                                            title="Delete User"
                                                            className="size-9 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 transition shadow-2xs cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
                                                        >
                                                            <TrashIcon size={14} color="#E11D48" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 7. Delete Confirmation Modal */}
            {deleteModal.isOpen && deleteModal.user && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !deleteModal.loading) {
                            setDeleteModal({ isOpen: false, user: null, loading: false })
                        }
                    }}
                >
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE0EF] shadow-2xl space-y-4 animate-[modalLuxuryPop_0.22s_cubic-bezier(0.16,1,0.3,1)]">
                        <div className="flex items-start gap-3.5">
                            <div className="size-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                                <TrashIcon size={22} color="#E11D48" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-extrabold text-[#241224] tracking-tight">
                                    Delete User Account?
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    Are you sure you want to remove <strong className="text-slate-800">{deleteModal.user.name}</strong> ({deleteModal.user.email})? If this user has existing customer orders, their staff privileges will be revoked and account deactivated to safely preserve order integrity.
                                </p>
                            </div>
                        </div>

                        {/* User Details Callout */}
                        <div className="p-3.5 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-xs space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold">Account:</span>
                                <span className="font-extrabold text-[#241224]">{deleteModal.user.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold">Email:</span>
                                <span className="font-mono text-slate-700">{deleteModal.user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold">Role:</span>
                                <span className="font-bold text-[#6C306E]">{deleteModal.user.role}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={() => setDeleteModal({ isOpen: false, user: null, loading: false })}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={handleConfirmDelete}
                                className="px-5 py-2 rounded-xl text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                            >
                                {deleteModal.loading ? (
                                    <>
                                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete Account</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. Granular Permissions Configuration Modal */}
            {permModal.isOpen && permModal.user && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !permModal.loading) {
                            setPermModal({ isOpen: false, user: null, permissions: [], loading: false })
                        }
                    }}
                >
                    <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE0EF] shadow-2xl space-y-5 animate-[modalLuxuryPop_0.22s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between gap-3 border-b border-[#EFE0EF] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
                                    <UserCheckIcon size={22} color="#1D4ED8" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#241224] tracking-tight">
                                        Staff Permissions: {permModal.user.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {permModal.user.email} &bull; Toggle the pages this employee is allowed to view and manage
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPermModal({ isOpen: false, user: null, permissions: [], loading: false })}
                                className="size-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition shrink-0"
                            >
                                <CloseIcon size={14} />
                            </button>
                        </div>

                        {/* Select All Toggle Bar */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-slate-600">
                                {permModal.permissions.length} of {MODULE_PERMISSIONS.length} modules granted
                            </span>
                            <button
                                type="button"
                                onClick={handleToggleAllPerms}
                                className="text-xs font-bold text-[#6C306E] hover:underline cursor-pointer"
                            >
                                {permModal.permissions.length === MODULE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {/* Checkboxes List */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[48vh]">
                            {MODULE_PERMISSIONS.map((perm) => {
                                const isChecked = permModal.permissions.includes(perm.id);
                                return (
                                    <div
                                        key={perm.id}
                                        onClick={() => handleTogglePerm(perm.id)}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                            isChecked
                                                ? 'bg-[#FAF6FA] border-[#6C306E] ring-1 ring-[#6C306E]/20'
                                                : 'bg-white border-[#EFE0EF] hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-[#241224] flex items-center gap-2">
                                                <span>{perm.name}</span>
                                                <span className="font-mono text-[10px] text-slate-400 font-normal">({perm.id})</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                {perm.description}
                                            </p>
                                        </div>

                                        <div className={`size-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isChecked
                                                ? 'bg-[#6C306E] border-[#6C306E] text-white shadow-2xs'
                                                : 'border-slate-300 bg-white'
                                        }`}>
                                            {isChecked && <CheckIcon size={12} color="#FFFFFF" strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EFE0EF]">
                            <button
                                type="button"
                                disabled={permModal.loading}
                                onClick={() => setPermModal({ isOpen: false, user: null, permissions: [], loading: false })}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={permModal.loading}
                                onClick={handleSavePermissions}
                                className="px-6 py-2 rounded-xl text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#531e55] disabled:opacity-50"
                            >
                                {permModal.loading ? (
                                    <>
                                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <span>Save Permissions</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
