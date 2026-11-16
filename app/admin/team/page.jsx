'use client'

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
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
    UserMinusIcon,
    UserPlusIcon,
    BanIcon,
    ClockIcon,
    TrashIcon,
    AlertCircleIcon
} from "@/components/icons"

export default function AdminTeamPage() {
    const [teamMembers, setTeamMembers] = useState([])
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        totalStaff: 0,
        totalAdmins: 0,
        totalEmployees: 0,
        pendingApprovals: 0,
        totalBlocked: 0,
        activeApproved: 0,
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [filterTab, setFilterTab] = useState('all') // 'all' | 'pending' | 'active' | 'employees' | 'admins' | 'blocked'
    const [actionLoading, setActionLoading] = useState(false)

    // Current logged-in user from localStorage to prevent self-demotion in UI
    const [currentUser, setCurrentUser] = useState(null)

    // Action Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        user: null,
        actionType: null, // 'promote_admin' | 'demote_employee' | 'demote_customer' | 'block' | 'unblock' | 'set_pending' | 'approve' | 'delete'
        title: '',
        message: '',
        confirmButtonText: 'Confirm',
        confirmButtonColor: 'bg-[#6C306E]',
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) setCurrentUser(JSON.parse(saved))
            } catch {}
        }
    }, [])

    const fetchTeam = async (query = searchQuery) => {
        try {
            setLoading(true)
            const endpoint = query.trim()
                ? `/api/admin/team?search=${encodeURIComponent(query.trim())}`
                : '/api/admin/team'
            const res = await fetch(endpoint)
            const data = await res.json()

            if (data.success && Array.isArray(data.users)) {
                setTeamMembers(data.users)
                if (data.stats) setStats(data.stats)
                setIsSearching(Boolean(data.isSearching))
            } else {
                setTeamMembers([])
                setIsSearching(false)
            }
        } catch (error) {
            console.error('Error fetching team members:', error)
            toast.error('Failed to load team data')
            setTeamMembers([])
        } finally {
            setLoading(false)
        }
    }

    // Debounced search trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeam(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter users based on active tab
    const filteredUsers = useMemo(() => {
        return teamMembers.filter(user => {
            if (filterTab === 'pending') {
                return user.isVerified === false
            }
            if (filterTab === 'active') {
                return user.isActive === true && user.isVerified === true
            }
            if (filterTab === 'employees') {
                return user.role === 'EMPLOYEE'
            }
            if (filterTab === 'admins') {
                return user.role === 'ADMIN'
            }
            if (filterTab === 'blocked') {
                return user.isActive === false
            }
            return true // 'all'
        })
    }, [teamMembers, filterTab])

    // Dynamic counts for each filter tab
    const tabCounts = useMemo(() => {
        const total = teamMembers.length
        const pending = teamMembers.filter(u => u.isVerified === false).length
        const active = teamMembers.filter(u => u.isActive === true && u.isVerified === true).length
        const employees = teamMembers.filter(u => u.role === 'EMPLOYEE').length
        const admins = teamMembers.filter(u => u.role === 'ADMIN').length
        const blocked = teamMembers.filter(u => u.isActive === false).length

        return {
            all: total,
            pending: stats.pendingApprovals !== undefined ? stats.pendingApprovals : pending,
            active: stats.activeApproved !== undefined ? stats.activeApproved : active,
            employees: stats.totalEmployees !== undefined ? stats.totalEmployees : employees,
            admins: stats.totalAdmins !== undefined ? stats.totalAdmins : admins,
            blocked: stats.totalBlocked !== undefined ? stats.totalBlocked : blocked,
        }
    }, [teamMembers, stats])

    // Trigger action confirmation modal
    const openActionModal = (user, actionType) => {
        if (!user) return

        const isSelf = currentUser && currentUser.id === user.id

        if (actionType === 'demote_employee') {
            if (isSelf) {
                toast.error('You cannot demote your own Administrator account.')
                return
            }
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Demote to Employee?',
                message: `Are you sure you want to demote ${user.name} (${user.email}) from Administrator to Employee? They will lose access to Store Directives, AI Bot Settings, and Staff Permissions.`,
                confirmButtonText: 'Demote to Employee',
                confirmButtonColor: 'bg-amber-600 hover:bg-amber-700',
            })
        } else if (actionType === 'promote_admin') {
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Promote to Full Administrator?',
                message: `Are you sure you want to promote ${user.name} (${user.email}) to Full Administrator? They will have full access to all areas of the store administration panel.`,
                confirmButtonText: 'Promote to Admin',
                confirmButtonColor: 'bg-[#6C306E] hover:bg-[#531e55]',
            })
        } else if (actionType === 'make_employee') {
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Appoint as Staff Employee?',
                message: `Are you sure you want to grant employee permissions to ${user.name} (${user.email})? They will be able to process customer orders, update stock, and handle inquiries.`,
                confirmButtonText: 'Make Employee',
                confirmButtonColor: 'bg-blue-600 hover:bg-blue-700',
            })
        } else if (actionType === 'demote_customer') {
            if (isSelf) {
                toast.error('You cannot revoke your own staff privileges.')
                return
            }
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Revoke Staff Privileges?',
                message: `Are you sure you want to remove staff privileges for ${user.name} (${user.email}) and set them back to regular Customer? They will no longer have access to the Admin Panel.`,
                confirmButtonText: 'Revoke Privileges',
                confirmButtonColor: 'bg-rose-600 hover:bg-rose-700',
            })
        } else if (actionType === 'block') {
            if (isSelf) {
                toast.error('You cannot block your own account.')
                return
            }
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Block User Access?',
                message: `Are you sure you want to block ${user.name} (${user.email})? They will not be able to sign in or perform any actions on the store.`,
                confirmButtonText: 'Block User',
                confirmButtonColor: 'bg-rose-600 hover:bg-rose-700',
            })
        } else if (actionType === 'unblock') {
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Unblock User Account?',
                message: `Restore login access and active status for ${user.name} (${user.email})?`,
                confirmButtonText: 'Unblock Account',
                confirmButtonColor: 'bg-emerald-600 hover:bg-emerald-700',
            })
        } else if (actionType === 'set_pending') {
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Mark as Pending Approval?',
                message: `Set verification status of ${user.name} (${user.email}) to Pending?`,
                confirmButtonText: 'Set Pending',
                confirmButtonColor: 'bg-amber-600 hover:bg-amber-700',
            })
        } else if (actionType === 'approve') {
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Approve User Account?',
                message: `Mark ${user.name} (${user.email}) as Active & Approved?`,
                confirmButtonText: 'Approve Account',
                confirmButtonColor: 'bg-emerald-600 hover:bg-emerald-700',
            })
        } else if (actionType === 'delete') {
            if (isSelf) {
                toast.error('You cannot delete your own account.')
                return
            }
            setConfirmModal({
                isOpen: true,
                user,
                actionType,
                title: 'Delete User Account?',
                message: `Are you sure you want to remove ${user.name} (${user.email})? If they have existing customer orders, their staff role will be revoked and account deactivated to preserve order integrity.`,
                confirmButtonText: 'Delete Account',
                confirmButtonColor: 'bg-rose-600 hover:bg-rose-700',
            })
        }
    }

    // Execute the confirmed action
    const handleExecuteAction = async () => {
        const { user, actionType } = confirmModal
        if (!user || !actionType) return

        try {
            setActionLoading(true)

            let bodyPayload = { targetUserId: user.id }

            if (actionType === 'demote_employee') {
                bodyPayload.newRole = 'EMPLOYEE'
            } else if (actionType === 'promote_admin') {
                bodyPayload.newRole = 'ADMIN'
            } else if (actionType === 'make_employee') {
                bodyPayload.newRole = 'EMPLOYEE'
            } else if (actionType === 'demote_customer') {
                bodyPayload.newRole = 'CUSTOMER'
            } else if (actionType === 'block') {
                bodyPayload.isActive = false
            } else if (actionType === 'unblock') {
                bodyPayload.isActive = true
            } else if (actionType === 'set_pending') {
                bodyPayload.isVerified = false
            } else if (actionType === 'approve') {
                bodyPayload.isVerified = true
                bodyPayload.isActive = true
            } else if (actionType === 'delete') {
                bodyPayload.action = 'delete'
            }

            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Action failed')
                return
            }

            toast.success(data.message || 'Updated successfully')
            setConfirmModal({ isOpen: false, user: null, actionType: null, title: '', message: '' })

            // Instantly refresh list and stats
            await fetchTeam(searchQuery)
        } catch (error) {
            console.error('Error executing team action:', error)
            toast.error('An error occurred while updating permissions')
        } finally {
            setActionLoading(false)
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
                    onClick={() => fetchTeam(searchQuery)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:text-[#6C306E] text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <RefreshIcon size={14} className={loading ? "animate-spin text-[#6C306E]" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* 3. Top 5 Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Card 1: Total Registrations */}
                <div
                    onClick={() => setFilterTab('all')}
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
                                {stats.totalRegistrations || teamMembers.length}
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

                {/* Card 2: Pending Approvals */}
                <div
                    onClick={() => setFilterTab('pending')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'pending'
                            ? 'border-2 border-amber-500 ring-2 ring-amber-500/10'
                            : 'border-[#EFE0EF] hover:border-amber-300'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
                        <ClockIcon size={20} color="#D97706" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {tabCounts.pending}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Pending Approvals
                        </div>
                    </div>
                </div>

                {/* Card 3: Full Administrators */}
                <div
                    onClick={() => setFilterTab('admins')}
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
                            {tabCounts.admins}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Full Administrators
                        </div>
                    </div>
                </div>

                {/* Card 4: Employees */}
                <div
                    onClick={() => setFilterTab('employees')}
                    className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-3 ${
                        filterTab === 'employees'
                            ? 'border-2 border-emerald-600 ring-2 ring-emerald-600/10'
                            : 'border-[#EFE0EF] hover:border-emerald-300'
                    }`}
                >
                    <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                        <UserCheckIcon size={20} color="#059669" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-[#241224] leading-none">
                            {tabCounts.employees}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Employees
                        </div>
                    </div>
                </div>

                {/* Card 5: Rejected / Blocked */}
                <div
                    onClick={() => setFilterTab('blocked')}
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
                            {tabCounts.blocked}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                            Rejected / Blocked
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Filter Tabs Row (Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { id: 'all', label: 'All Users', count: tabCounts.all },
                    { id: 'pending', label: 'Pending Approval', count: tabCounts.pending },
                    { id: 'active', label: 'Active (Approved)', count: tabCounts.active },
                    { id: 'employees', label: 'Employees', count: tabCounts.employees },
                    { id: 'admins', label: 'Administrators', count: tabCounts.admins },
                    { id: 'blocked', label: 'Blocked / Rejected', count: tabCounts.blocked },
                ].map(tab => {
                    const isActive = filterTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterTab(tab.id)}
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

            {/* 5. Clean Search Bar */}
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
            {isSearching && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#6C306E] animate-pulse" />
                        <span>Showing database search results for &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                        {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} found
                    </span>
                </div>
            )}

            {/* 6. Main Team & Access Management Table */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xs overflow-hidden">
                {loading ? (
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
                    <div className="overflow-x-auto">
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
                                    const isSelf = currentUser && currentUser.id === user.id
                                    const isAdmin = user.role === 'ADMIN'
                                    const isEmployee = user.role === 'EMPLOYEE'
                                    const isCustomer = user.role === 'CUSTOMER'
                                    const isBlocked = user.isActive === false
                                    const isPending = user.isVerified === false

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
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs">
                                                        <UserCheckIcon size={14} color="#1D4ED8" />
                                                        <span>Employee (Staff)</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold shadow-2xs">
                                                        <UserIcon size={14} color="#475569" />
                                                        <span>Customer</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column 3: Access Status */}
                                            <td className="py-4 px-4 align-middle whitespace-nowrap">
                                                {isBlocked ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                                                        <span className="size-1.5 rounded-full bg-rose-500" />
                                                        <span>Blocked / Rejected</span>
                                                    </span>
                                                ) : isPending ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-2xs">
                                                        <span className="size-1.5 rounded-full bg-amber-500" />
                                                        <span>Pending Approval</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        <span>Active (Approved)</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column 4: Joined Date */}
                                            <td className="py-4 px-4 align-middle whitespace-nowrap text-xs text-slate-600 font-medium">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            {/* Column 5: Management Actions */}
                                            <td className="py-4 px-5 sm:px-6 align-middle">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Admin Actions */}
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={isSelf}
                                                                onClick={() => openActionModal(user, 'demote_employee')}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                                                                    isSelf
                                                                        ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                                                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 cursor-pointer'
                                                                }`}
                                                            >
                                                                <UserMinusIcon size={14} color="currentColor" />
                                                                <span>Demote to Employee</span>
                                                            </button>

                                                            {!isSelf && (
                                                                <>
                                                                    {isBlocked ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openActionModal(user, 'unblock')}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                        >
                                                                            <CheckIcon size={13} color="#059669" />
                                                                            <span>Unblock</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openActionModal(user, 'block')}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                        >
                                                                            <BanIcon size={13} color="#E11D48" />
                                                                            <span>Block</span>
                                                                        </button>
                                                                    )}

                                                                    {isPending ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openActionModal(user, 'approve')}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                        >
                                                                            <CheckIcon size={13} color="#059669" />
                                                                            <span>Approve</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openActionModal(user, 'set_pending')}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                        >
                                                                            <ClockIcon size={13} color="#D97706" />
                                                                            <span>Set Pending</span>
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openActionModal(user, 'delete')}
                                                                        title="Delete User"
                                                                        className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 transition shadow-2xs cursor-pointer"
                                                                    >
                                                                        <TrashIcon size={14} color="#E11D48" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Employee Actions */}
                                                    {isEmployee && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal(user, 'promote_admin')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C306E] hover:bg-[#531e55] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                                                            >
                                                                <ShieldCheckIcon size={14} color="#FFFFFF" />
                                                                <span>Promote to Admin</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal(user, 'demote_customer')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition shadow-2xs cursor-pointer"
                                                            >
                                                                <UserMinusIcon size={14} color="currentColor" />
                                                                <span>Revoke Staff</span>
                                                            </button>

                                                            {isBlocked ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'unblock')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <CheckIcon size={13} color="#059669" />
                                                                    <span>Unblock</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'block')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <BanIcon size={13} color="#E11D48" />
                                                                    <span>Block</span>
                                                                </button>
                                                            )}

                                                            {isPending ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'approve')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <CheckIcon size={13} color="#059669" />
                                                                    <span>Approve</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'set_pending')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <ClockIcon size={13} color="#D97706" />
                                                                    <span>Set Pending</span>
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal(user, 'delete')}
                                                                title="Delete User"
                                                                className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 transition shadow-2xs cursor-pointer"
                                                            >
                                                                <TrashIcon size={14} color="#E11D48" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Customer Actions (When found through Search) */}
                                                    {isCustomer && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal(user, 'make_employee')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                                                            >
                                                                <UserPlusIcon size={14} color="#FFFFFF" />
                                                                <span>Make Employee</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal(user, 'promote_admin')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C306E] hover:bg-[#531e55] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                                                            >
                                                                <ShieldCheckIcon size={14} color="#FFFFFF" />
                                                                <span>Make Admin</span>
                                                            </button>

                                                            {isBlocked ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'unblock')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <CheckIcon size={13} color="#059669" />
                                                                    <span>Unblock</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openActionModal(user, 'block')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                                >
                                                                    <BanIcon size={13} color="#E11D48" />
                                                                    <span>Block</span>
                                                                </button>
                                                            )}
                                                        </>
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

            {/* 7. Action Confirmation Modal */}
            {confirmModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !actionLoading) {
                            setConfirmModal({ isOpen: false, user: null, actionType: null, title: '', message: '' })
                        }
                    }}
                >
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE0EF] shadow-2xl space-y-4 animate-[modalLuxuryPop_0.22s_cubic-bezier(0.16,1,0.3,1)]">
                        <div className="flex items-start gap-3.5">
                            <div className="size-11 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0 shadow-2xs">
                                <AlertCircleIcon size={22} color="#6C306E" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-extrabold text-[#241224] tracking-tight">
                                    {confirmModal.title}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                    {confirmModal.message}
                                </p>
                            </div>
                        </div>

                        {/* User Details Callout */}
                        {confirmModal.user && (
                            <div className="p-3.5 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-semibold">Account:</span>
                                    <span className="font-extrabold text-[#241224]">{confirmModal.user.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-semibold">Email:</span>
                                    <span className="font-mono text-slate-700">{confirmModal.user.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-semibold">Current Role:</span>
                                    <span className="font-bold text-[#6C306E]">{confirmModal.user.role}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setConfirmModal({ isOpen: false, user: null, actionType: null, title: '', message: '' })}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleExecuteAction}
                                className={`px-5 py-2 rounded-xl text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50 ${confirmModal.confirmButtonColor}`}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>{confirmModal.confirmButtonText}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
