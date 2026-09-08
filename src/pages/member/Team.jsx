import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactFlow, {
  Controls, Background, MiniMap, useNodesState, useEdgesState,
  ReactFlowProvider, useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Users, GitBranch, Search, Award, ShieldCheck,
  UserPlus, Zap, Database, Copy, Check,
  Mail, Phone, Calendar, Share2, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatNumber, formatDate, getRankDisplay, getInitials } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import MemberTreeNode from '@/components/genealogy/MemberTreeNode'
import InviteTreeNode from '@/components/genealogy/InviteTreeNode'
import DatabaseSeedModal from '@/components/genealogy/DatabaseSeedModal'
import {
  getGenealogyMembers, buildReactFlowTree
} from '@/services/genealogyService'
import { toast } from 'sonner'

const NODE_TYPES = {
  memberNode: MemberTreeNode,
  inviteNode: InviteTreeNode,
}
const EDGE_TYPES = {}

function TeamPageContent() {
  const { profile } = useAuthStore()
  const [viewMode, setViewMode] = useState('tree') // 'tree' | 'table'
  const [treeType, setTreeType] = useState('SPONSOR') // 'SPONSOR' | 'PLACEMENT'
  const [members, setMembers] = useState([])
  const [dbSource, setDbSource] = useState('loading')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const [selectedMember, setSelectedMember] = useState(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set())
  const [copiedId, setCopiedId] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowInstance = useReactFlow()

  // Load members from Database
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getGenealogyMembers()
      setMembers(res.members)
      setDbSource(res.source)
    } catch (e) {
      toast.error('Failed to load database: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Scope members strictly to the current logged-in user's team downline
  const userTeamMembers = useMemo(() => {
    if (!profile?.id) return members
    if (members.length === 0) return [profile]

    const childMap = new Map()
    members.forEach((m) => {
      const parent = treeType === 'PLACEMENT' ? m.parent_id : m.sponsor_id
      if (parent) {
        if (!childMap.has(parent)) childMap.set(parent, [])
        childMap.get(parent).push(m)
      }
    })

    const root = members.find((m) => m.id === profile.id) || profile
    const downline = [root]
    const queue = [root.id]

    while (queue.length > 0) {
      const currId = queue.shift()
      const children = childMap.get(currId) || []
      for (const child of children) {
        downline.push(child)
        queue.push(child.id)
      }
    }

    return downline
  }, [members, profile, treeType])

  // Handle branch expand / collapse
  const handleToggleCollapse = useCallback((nodeId) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  // Build spacious tree with root strictly set to logged-in user
  useEffect(() => {
    if (userTeamMembers.length > 0) {
      const { nodes: flowNodes, edges: flowEdges } = buildReactFlowTree(
        userTeamMembers,
        treeType,
        collapsedNodeIds,
        profile?.id
      )

      // Inject the toggle handler into node data
      const mappedNodes = flowNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onToggle: handleToggleCollapse,
        },
      }))

      setNodes(mappedNodes)
      setEdges(flowEdges)
    }
  }, [userTeamMembers, treeType, collapsedNodeIds, profile?.id, handleToggleCollapse, setNodes, setEdges])

  // Node click handler opens inspector
  const onNodeClick = useCallback((event, node) => {
    const member = node.data?.member
    if (member) {
      setSelectedMember(member)
    }
  }, [])

  // Locate Node by Search
  const handleSearchNode = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const target = userTeamMembers.find(
      (m) =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (target) {
      setSelectedMember(target)
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === target.id,
        }))
      )
      if (reactFlowInstance) {
        const found = nodes.find((n) => n.id === target.id)
        if (found) {
          reactFlowInstance.setCenter(found.position.x + 150, found.position.y + 90, {
            duration: 800,
            zoom: 1.1,
          })
        }
      }
      toast.success(`Found distributor ${target.full_name}`)
    } else {
      toast.error('No distributor matching "' + searchQuery + '" in your team')
    }
  }

  // Filtered members for Table View (only team members)
  const filteredMembers = useMemo(() => {
    return userTeamMembers.filter((m) => {
      const matchesSearch =
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLevel =
        selectedLevel === 'ALL' || m.level?.toString() === selectedLevel
      return matchesSearch && matchesLevel
    })
  }, [userTeamMembers, searchQuery, selectedLevel])

  // User-specific Team Statistics
  const downlineCount = Math.max(0, userTeamMembers.length - 1)
  const directCount = profile?.direct_referrals_count || 0
  const teamBV = profile?.team_bv || 0
  const isPersonalQualified = (profile?.personal_pv || 0) >= 25

  // Highest downline rank (excluding current user)
  const downlineMembersOnly = userTeamMembers.filter((m) => m.id !== profile?.id)
  const highestRankMember = downlineMembersOnly.length > 0 ? downlineMembersOnly[0] : null

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ─────────────────────────────────────────────
          PAGE HEADER & TOOLBAR
      ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              My Team Network
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 Live Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual hierarchy of your direct distributors and 13-generation downline organization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/referral"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#853953] text-white font-bold text-xs hover:bg-[#9e4363] transition shadow-sm active:scale-95"
          >
            <UserPlus size={15} />
            <span>Invite Downline</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          ACCURATE TEAM METRICS TILES
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Downline</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 mt-2">
            {downlineCount} {downlineCount === 1 ? 'Member' : 'Members'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {downlineCount === 0 ? 'Start sharing your link to build team' : 'Across your network generations'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Sponsors (L1)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-600 mt-2">
            {directCount} {directCount === 1 ? 'Direct' : 'Directs'}
          </div>
          <p className={`text-xs font-bold mt-1 ${isPersonalQualified ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isPersonalQualified ? '✓ Active Qualified (25+ PV)' : 'Qualification Pending (25 PV)'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Business Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-emerald-600 mt-2">
            {formatNumber(teamBV)} BV
          </div>
          <p className="text-xs text-slate-500 mt-1">Accumulated cycle volume</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Downline Rank</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#853953] flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#853953] mt-2">
            {highestRankMember ? getRankDisplay(highestRankMember.rank_code).name : 'None'}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {highestRankMember ? highestRankMember.full_name : 'Starts with your first recruit'}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          MAIN CANVAS & CONTROLS WRAPPER
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Toolbar: Search, Tree Mode, View Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Search bar */}
          <form onSubmit={handleSearchNode} className="relative flex-1 max-w-md">
            <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team member by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#853953] focus:outline-none bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#853953] hover:bg-[#9e4363] text-white text-[11px] font-bold rounded-lg transition"
            >
              Locate
            </button>
          </form>

          {/* Mode & View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tree Mode Switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTreeType('SPONSOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  treeType === 'SPONSOR'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sponsor Lineage
              </button>
              <button
                onClick={() => setTreeType('PLACEMENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  treeType === 'PLACEMENT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Binary Placement
              </button>
            </div>

            {/* View Mode (Tree vs Table) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'tree'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch size={13} />
                Tree
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={13} />
                Table ({userTeamMembers.length})
              </button>
            </div>
          </div>
        </div>

        {/* Visual React Flow Canvas */}
        {viewMode === 'tree' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Main Interactive React Flow Area */}
            <div className={`${selectedMember ? 'xl:col-span-8' : 'xl:col-span-12'} h-[660px] rounded-2xl border border-slate-200 overflow-hidden relative bg-slate-50/80 transition-all duration-300`}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.35, maxZoom: 1.15 }}
                minZoom={0.2}
                maxZoom={2.0}
              >
                <Background color="#cbd5e1" gap={24} size={1} />
                <Controls showInteractive={false} className="!bg-white !rounded-xl !border-slate-200 !shadow-md" />
                <MiniMap
                  nodeColor={(n) => {
                    if (n.type === 'inviteNode') return '#853953'
                    const r = n.data?.member?.rank_code
                    if (r === 'CROWN_AMBASSADOR') return '#f59e0b'
                    if (r === 'JAMPLE_DIRECTOR') return '#10b981'
                    if (r === 'RUBY_EXECUTIVE') return '#853953'
                    return '#3b82f6'
                  }}
                  className="!rounded-xl !border-slate-200 !shadow-md"
                />
              </ReactFlow>

              {/* Floating Tree Legend */}
              <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-[11px] space-y-1.5 shadow-lg max-w-[200px]">
                <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1">
                  Genealogy Legend:
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-900 ring-2 ring-slate-300" /> You (Root Account)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Active Qualified (25+ PV)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#853953] ring-2 ring-[#853953]/30" /> Ruby Executive
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-300" /> Director
                </div>
              </div>

              {/* Canvas controls quick-help */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 shadow-xs flex items-center gap-2">
                <span>🖱️ Drag to pan • Scroll to zoom • Click card to inspect</span>
              </div>
            </div>

            {/* Slide-in Detailed Member Inspector Drawer */}
            {selectedMember && (
              <div className="xl:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#853953]" />
                    Distributor Profile
                  </h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] text-white flex items-center justify-center font-black text-base shadow-sm">
                      {getInitials(selectedMember.full_name)}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-tight">
                        {selectedMember.full_name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {selectedMember.member_id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMember.member_id)
                            setCopiedId(true)
                            toast.success('ID copied!')
                            setTimeout(() => setCopiedId(false), 2000)
                          }}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                        >
                          {copiedId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {getRankDisplay(selectedMember.rank_code).name}
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck size={13} /> Active ({selectedMember.personal_pv || 0} PV)
                    </span>
                  </div>
                </div>

                {/* Detailed Performance Metrics */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Generation Level:</span>
                    <strong className="text-slate-900">
                      {selectedMember.id === profile?.id ? '0 (You)' : `Level ${selectedMember.level || 1}`}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Personal PV / BV:</span>
                    <strong className="text-[#853953]">{selectedMember.personal_pv || 0} PV / {selectedMember.personal_bv || 0} BV</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Team Business Volume:</span>
                    <strong className="text-emerald-600">{formatNumber(selectedMember.team_bv || 0)} BV</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Left / Right Leg Volume:</span>
                    <strong className="text-slate-900">
                      {formatNumber(selectedMember.left_bv || 0)} L / {formatNumber(selectedMember.right_bv || 0)} R
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Direct Sponsors (L1):</span>
                    <strong className="text-slate-900">{selectedMember.direct_referrals_count || 0} Directs</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Total Team Downline:</span>
                    <strong className="text-purple-700 font-bold">{selectedMember.total_downline_count || 0} Members</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Wallet Balance:</span>
                    <strong className="text-slate-900">{formatCurrency(selectedMember.wallet_balance || 0)}</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Lifetime Earnings:</span>
                    <strong className="text-emerald-600 font-bold">{formatCurrency(selectedMember.total_earned || 0)}</strong>
                  </div>
                </div>

                {/* Contact & Meta */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span>{selectedMember.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span>{selectedMember.mobile || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Joined: {selectedMember.joined_at ? formatDate(selectedMember.joined_at) : 'Recent'}</span>
                  </div>
                </div>

                {/* Action: Copy Sponsor Placement Link */}
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/register?ref=${selectedMember.member_id}`
                    navigator.clipboard.writeText(link)
                    toast.success(`Placement link for ${selectedMember.full_name} copied!`)
                  }}
                  className="w-full py-2.5 bg-[#853953] hover:bg-[#9e4363] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 size={13} />
                  Copy Downline Placement Link
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Table Roster View */
          <div className="space-y-4">
            {downlineCount === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#853953]/10 text-[#853953] flex items-center justify-center">
                  <Users size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">No Team Members Recruited Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    You have not sponsored any downline distributors yet. Share your distributor referral link to build your team and unlock level bonuses.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                  <span className="font-mono font-bold text-[#853953]">{profile?.referral_code || profile?.member_id}</span>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/register?ref=${profile?.referral_code || profile?.member_id}`
                      navigator.clipboard.writeText(url)
                      toast.success('Referral link copied!')
                    }}
                    className="px-3 py-1 bg-[#853953] text-white font-bold rounded-lg text-xs hover:bg-[#9e4363] transition"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Member ID</th>
                      <th className="py-3.5 px-4">Full Name</th>
                      <th className="py-3.5 px-4">Level</th>
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Personal PV</th>
                      <th className="py-3.5 px-4">Team Volume</th>
                      <th className="py-3.5 px-4">Directs</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {m.member_id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {m.full_name} {m.id === profile?.id && <span className="ml-1 text-[10px] text-[#853953] font-black">(YOU)</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                            {m.id === profile?.id ? 'ROOT' : `L${m.level || 1}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            {getRankDisplay(m.rank_code).name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {m.personal_pv || 0} PV
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {formatNumber(m.team_bv || 0)} BV
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          {m.direct_referrals_count || 0}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {m.joined_at ? formatDate(m.joined_at) : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <StatusBadge status={m.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Database Seeding Modal */}
      <DatabaseSeedModal
        isOpen={showSeedModal}
        onClose={() => setShowSeedModal(false)}
        onDataReloaded={loadData}
        dbSource={dbSource}
      />
    </div>
  )
}

export default function TeamPage() {
  return (
    <ReactFlowProvider>
      <TeamPageContent />
    </ReactFlowProvider>
  )
}
