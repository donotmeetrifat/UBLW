'use client'

import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    SearchIcon,
    CloseIcon,
    RefreshIcon,
    CheckIcon,
    LockIcon
} from "@/components/icons"

export default function AdminTeamPage() {
    const [teamMembers, setTeamMembers] = useState([])
    const [stats, setStats] = useState({ totalAdmins: 0, totalEmployees: 0, activeStaff: 0 })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Current logged-in user from localStorage to prevent self-demotion in UI
    const [currentUser, setCurrentUser] = useState(null)

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        user: null,
        targetRole: 'EMPLOYEE',
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
        }, 320)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Open confirmation modal for role change
    const promptRoleChange = (user, newRole) => {
        if (!user || user.role === newRole) return

        // Self-demotion check
        if (currentUser && currentUser.id === user.id && newRole !== 'ADMIN') {
            toast.error('You cannot demote your own Admin account.')
            return
        }

        setConfirmModal({
            isOpen: true,
            user,
            targetRole: newRole,
        })
    }

    // Execute role change after confirmation
    const handleConfirmRoleChange = async () => {
        const { user, targetRole } = confirmModal
        if (!user || !targetRole) return

        try {
            setActionLoading(true)
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: user.id,
                    newRole: targetRole,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to update role')
                return
            }

            toast.success(data.message || 'Role updated successfully')
            setConfirmModal({ isOpen: false, user: null, targetRole: 'EMPLOYEE' })

            // Instantly refresh list and stats
            await fetchTeam(searchQuery)
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('An error occurred while updating permissions')
        } finally {
            setActionLoading(false)
        }
    }

    // Toggle active / inactive status
    const handleToggleActive = async (user) => {
        if (!user) return
        if (currentUser && currentUser.id === user.id) {
            toast.error('You cannot deactivate your own account.')
            return
        }

        const newStatus = !user.isActive

        try {
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
                toast.error(data.message || 'Failed to update status')
                return
            }

            toast.success(`Account marked ${newStatus ? 'Active' : 'Inactive'}`)
            setTeamMembers(prev => prev.map(m => m.id === user.id ? { ...m, isActive: newStatus } : m))
        } catch (error) {
            console.error('Error toggling active status:', error)
            toast.error('Failed to change status')
        }
    }

    return (
        <div className="space-y-6">
            {/* 1. Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EFE0EF]">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight">
                        Team & Staff Permissions
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage administrators and employee access for store fulfillment, stock management, and customer inquiries.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => fetchTeam(searchQuery)}
                        className="h-9 px-4 rounded-xl border border-[#EFE0EF] hover:bg-slate-50 text-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <RefreshIcon size={13} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* 2. Key Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Administrators
                    </div>
                    <div className="text-2xl font-black text-[#6C306E] mt-1.5">
                        {stats.totalAdmins}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Full unrestricted control
                    </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Store Employees
                    </div>
                    <div className="text-2xl font-black text-blue-700 mt-1.5">
                        {stats.totalEmployees}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Orders, stock & inquiries access
                    </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Active Staff Members
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mt-1.5">
                        {stats.activeStaff}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                        Enabled for daily operations
                    </div>
                </div>
            </div>

            {/* 3. Search & Promote Bar */}
            <div className="bg-white rounded-2xl border border-[#EFE0EF] p-4 shadow-2xs space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search any customer by name, email, or phone to grant Admin or Employee permissions..."
                        className="w-full h-11 pl-10 pr-10 text-xs sm:text-[13px] bg-[#FAF6FA]/60 border border-[#EFE0EF] rounded-xl focus:bg-white focus:outline-none focus:border-[#6C306E] transition text-[#241224] placeholder:text-slate-400 font-medium"
                    />
                    <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                        <SearchIcon size={16} />
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                    <span>
                        {isSearching
                            ? `Showing search results for "${searchQuery}". Click "Change Role" to assign staff permissions.`
                            : "Showing active store staff only (Administrators & Employees)."}
                    </span>
                    {isSearching && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-[#6C306E] font-bold hover:underline cursor-pointer"
                        >
                            Back to Team Roster
                        </button>
                    )}
                </div>
            </div>

            {/* 4. Team Members List */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-[#EFE0EF] flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[#241224]">
                        {isSearching ? `Search Matches (${teamMembers.length})` : `Team Roster (${teamMembers.length})`}
                    </h3>
                    <span className="text-xs text-slate-400">
                        {isSearching ? 'Select a user to assign role' : 'Admins and Store Employees'}
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loading />
                    </div>
                ) : teamMembers.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        {isSearching
                            ? `No users found matching "${searchQuery}". Try searching by another email, name, or phone number.`
                            : "No administrators or employees configured yet."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#EFE0EF] bg-[#FAF6FA]/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-5">Member</th>
                                    <th className="py-3 px-5">Contact</th>
                                    <th className="py-3 px-5">Role</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5">Joined</th>
                                    <th className="py-3 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/80">
                                {teamMembers.map((member) => {
                                    const isSelf = currentUser && currentUser.id === member.id

                                    return (
                                        <tr key={member.id} className="hover:bg-[#FAF6FA]/30 transition">
                                            {/* Name & Initials */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-[#FAF6FA] border border-[#E5D5E5] text-[#6C306E] font-black text-xs flex items-center justify-center shrink-0">
                                                        {(member.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#241224] text-xs sm:text-[13px] flex items-center gap-1.5">
                                                            <span>{member.name || 'Anonymous User'}</span>
                                                            {isSelf && (
                                                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone / WhatsApp */}
                                            <td className="py-3.5 px-5">
                                                <div className="text-slate-600 font-mono text-[11.5px]">
                                                    {member.phone || member.whatsapp || 'No phone recorded'}
                                                </div>
                                            </td>

                                            {/* Clean Plain Text Role Badge (No Icons as requested) */}
                                            <td className="py-3.5 px-5">
                                                {member.role === 'ADMIN' ? (
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF6FA] text-[#6C306E] border border-[#E5D5E5]">
                                                        Admin
                                                    </span>
                                                ) : member.role === 'EMPLOYEE' ? (
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Employee
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        Customer
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Switch */}
                                            <td className="py-3.5 px-5">
                                                <button
                                                    type="button"
                                                    disabled={isSelf}
                                                    onClick={() => handleToggleActive(member)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        member.isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    <span className={`size-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    <span>{member.isActive ? 'Active' : 'Inactive'}</span>
                                                </button>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-GB') : '—'}
                                            </td>

                                            {/* Action Dropdown / Button */}
                                            <td className="py-3.5 px-5 text-right">
                                                {isSelf ? (
                                                    <span className="text-[11px] text-slate-400 italic">Current Session</span>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1">
                                                        {member.role !== 'ADMIN' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => promptRoleChange(member, 'ADMIN')}
                                                                className="px-2.5 py-1 rounded-lg bg-[#6C306E] hover:bg-[#531e55] text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                                                            >
                                                                Make Admin
                                                            </button>
                                                        )}

                                                        {member.role !== 'EMPLOYEE' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => promptRoleChange(member, 'EMPLOYEE')}
                                                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                                                            >
                                                                Make Employee
                                                            </button>
                                                        )}

                                                        {member.role !== 'CUSTOMER' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => promptRoleChange(member, 'CUSTOMER')}
                                                                className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                                                            >
                                                                Demote to Customer
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 5. Permission Confirmation Modal (Safe Before-Action Guard) */}
            {confirmModal.isOpen && confirmModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                            <h4 className="text-base font-extrabold text-[#241224]">
                                Confirm Role Change
                            </h4>
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: false, user: null, targetRole: 'EMPLOYEE' })}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-slate-600">
                                Are you sure you want to change permissions for{' '}
                                <strong className="text-[#241224]">{confirmModal.user.name}</strong> ({confirmModal.user.email})?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-1.5">
                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                    New Assigned Role:
                                </div>
                                <div className="text-sm font-extrabold text-[#6C306E]">
                                    {confirmModal.targetRole === 'ADMIN' && 'Admin (Full Access)'}
                                    {confirmModal.targetRole === 'EMPLOYEE' && 'Employee (Operations Access)'}
                                    {confirmModal.targetRole === 'CUSTOMER' && 'Customer (No Admin Access)'}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    {confirmModal.targetRole === 'ADMIN' && 'Full access to financial settings, AI API keys, delivery configurations, and team roles.'}
                                    {confirmModal.targetRole === 'EMPLOYEE' && 'Can view orders, stock/products, customer inquiries, and views & analytics. Restricted from store API keys, financial payment settings, and role management.'}
                                    {confirmModal.targetRole === 'CUSTOMER' && 'Standard shopper account. Will lose access to the admin panel immediately.'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#EFE0EF] flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setConfirmModal({ isOpen: false, user: null, targetRole: 'EMPLOYEE' })}
                                className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer text-xs"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmRoleChange}
                                className="h-9 px-5 rounded-xl bg-[#6C306E] hover:bg-[#531e55] text-white font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon size={14} />
                                        <span>Confirm & Apply</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
