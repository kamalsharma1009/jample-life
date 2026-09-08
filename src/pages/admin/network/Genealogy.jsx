import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactFlow, {
  Controls, Background, MiniMap, useNodesState, useEdgesState,
  ReactFlowProvider, useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  GitBranch, Search, Filter, Users, Award, ShieldCheck,
  ChevronRight, Sparkles, UserPlus, ZoomIn, Info, Database,
  RefreshCw, Check, Copy, Layers, Share2, X
} from 'lucide-react'
import { formatCurrency, formatNumber, formatDate, getRankDisplay, getInitials } from '@/lib/utils'
import MemberTreeNode from '@/components/genealogy/MemberTreeNode'
import DatabaseSeedModal from '@/components/genealogy/DatabaseSeedModal'
import {
  getGenealogyMembers, buildReactFlowTree
} from '@/services/genealogyService'
import { toast } from 'sonner'

const NODE_TYPES = {
  memberNode: MemberTreeNode,
}
const EDGE_TYPES = {}

function AdminGenealogyContent() {
  const [treeType, setTreeType] = useState('SPONSOR') // 'SPONSOR' | 'PLACEMENT'
  const [members, setMembers] = useState([])
  const [dbSource, setDbSource] = useState('loading')
  const [loading, setLoading] = useState(true)
  const [searchMemberId, setSearchMemberId] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set())

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowInstance = useReactFlow()

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

  useEffect(() => {
    if (members.length > 0) {
      const { nodes: flowNodes, edges: flowEdges } = buildReactFlowTree(
        members,
        treeType,
        collapsedNodeIds
      )

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
  }, [members, treeType, collapsedNodeIds, handleToggleCollapse, setNodes, setEdges])

  const onNodeClick = useCallback((event, node) => {
    const member = node.data?.member
    if (member) {
      setSelectedMember(member)
    }
  }, [])

  const handleSearchNode = (e) => {
    e.preventDefault()
    if (!searchMemberId.trim()) return
    const target = members.find(
      (m) =>
        m.full_name.toLowerCase().includes(searchMemberId.toLowerCase()) ||
        m.member_id.toLowerCase().includes(searchMemberId.toLowerCase())
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
          reactFlowInstance.setCenter(found.position.x + 130, found.position.y + 80, {
            duration: 800,
            zoom: 1.2,
          })
        }
      }
      toast.success(`Located distributor ${target.full_name}`)
    } else {
      toast.error('No distributor matching "' + searchMemberId + '"')
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ─────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Company Genealogy Tree Explorer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {dbSource === 'supabase' ? '🟢 Supabase Live DB' : '🟡 Relational Database'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore 13-generation sponsor lineages, placement hierarchy, and member performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSeedModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
          >
            <Database size={14} className="text-[#853953]" />
            <span>Database Seed & Setup</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTreeType('SPONSOR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                treeType === 'SPONSOR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Sponsor Lineage
            </button>
            <button
              onClick={() => setTreeType('PLACEMENT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                treeType === 'PLACEMENT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Binary Placement
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SEARCH & TREE CONTAINER
      ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchNode} className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Locate Member by ID or Name (e.g. Rajesh, JL-2026-0091)..."
              value={searchMemberId}
              onChange={(e) => setSearchMemberId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#853953] focus:outline-none bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Locate Node
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Tree Canvas */}
          <div className={`${selectedMember ? 'lg:col-span-8' : 'lg:col-span-12'} h-[620px] rounded-2xl border border-slate-200 overflow-hidden relative bg-slate-50 transition-all`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.2}
              maxZoom={2.0}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls showInteractive={false} className="!bg-white !rounded-xl !border-slate-200 !shadow-md" />
              <MiniMap
                nodeColor={(n) => {
                  const r = n.data?.member?.rank_code
                  if (r === 'CROWN_AMBASSADOR') return '#f59e0b'
                  if (r === 'JAMPLE_DIRECTOR') return '#10b981'
                  if (r === 'RUBY_EXECUTIVE') return '#853953'
                  return '#3b82f6'
                }}
                className="!rounded-xl !border-slate-200 !shadow-md"
              />
            </ReactFlow>

            <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-[11px] space-y-1.5 shadow-lg max-w-[200px]">
              <span className="font-bold text-slate-800 block border-b border-slate-100 pb-1">Genealogy Legend:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-300" /> Crown / Director
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#853953] ring-2 ring-[#853953]/30" /> Ruby Executive
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Active Qualified (25 PV)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" /> Regular Member
              </div>
            </div>
          </div>

          {/* Node Inspector Sidebar */}
          {selectedMember && (
            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#853953]" />
                  Distributor Node Details
                </h3>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                  <span className="font-mono text-[11px] font-bold text-slate-400">{selectedMember.member_id}</span>
                  <h4 className="text-base font-black text-slate-900">{selectedMember.full_name}</h4>
                  <div className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full inline-block border border-rose-200">
                    {getRankDisplay(selectedMember.rank_code).name}
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Generation Level:</span>
                    <strong className="text-slate-900">Level {selectedMember.level || 0}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Personal PV / BV:</span>
                    <strong className="text-[#853953]">{selectedMember.personal_pv} PV / {selectedMember.personal_bv} BV</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Team Volume:</span>
                    <strong className="text-emerald-600 font-bold">{formatNumber(selectedMember.team_bv)} BV</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Left / Right Leg Volume:</span>
                    <strong className="text-slate-900">{formatNumber(selectedMember.left_bv || 0)} L / {formatNumber(selectedMember.right_bv || 0)} R</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Downline Size:</span>
                    <strong className="text-purple-700 font-bold">{selectedMember.total_downline_count} Members</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Wallet Balance:</span>
                    <strong className="text-slate-900">{formatCurrency(selectedMember.wallet_balance || 0)}</strong>
                  </div>
                </div>

                <Link
                  to={`/admin/members`}
                  className="w-full py-2.5 bg-[#853953] hover:bg-[#9e4363] text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-sm transition"
                >
                  View in Admin Member Directory <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <DatabaseSeedModal
        isOpen={showSeedModal}
        onClose={() => setShowSeedModal(false)}
        onDataReloaded={loadData}
        dbSource={dbSource}
      />
    </div>
  )
}

export default function AdminGenealogy() {
  return (
    <ReactFlowProvider>
      <AdminGenealogyContent />
    </ReactFlowProvider>
  )
}
