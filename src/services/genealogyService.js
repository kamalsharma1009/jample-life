import { supabase } from '@/lib/supabase'

/**
 * Fetch all network members directly from Supabase.
 * Connects to public.profiles and public.genealogy.
 */
export async function getGenealogyMembers() {
  try {
    const [profilesRes, genealogyRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'MEMBER')
        .order('joined_at', { ascending: true }),
      supabase
        .from('genealogy')
        .select('*')
    ])

    if (profilesRes.error) throw profilesRes.error
    if (genealogyRes.error) throw genealogyRes.error

    const profiles = profilesRes.data || []
    const genealogy = genealogyRes.data || []

    const gMap = new Map(genealogy.map(g => [g.member_id, g]))
    const merged = profiles.map(p => {
      const g = gMap.get(p.id) || {}
      return {
        ...p,
        sponsor_id: g.sponsor_id || null,
        parent_id: g.parent_id || null,
        position: g.position || null,
        level: g.level !== undefined ? g.level : 0,
        left_bv: Number(g.left_bv ?? p.left_bv ?? 0),
        right_bv: Number(g.right_bv ?? p.right_bv ?? 0),
      }
    })

    return { members: merged, source: 'supabase', error: null }
  } catch (err) {
    console.error('[GenealogyService] Supabase query error:', err)
    throw err
  }
}

/**
 * Converts a list of members from Supabase into a dynamic React Flow tree with generous spacious coordinates.
 * Supports:
 * - 'SPONSOR' mode: Unilevel sponsor generation tree
 * - 'PLACEMENT' mode: Binary Left/Right leg matrix tree
 */
export function buildReactFlowTree(members, mode = 'SPONSOR', collapsedNodeIds = new Set(), rootMemberId = null) {
  if (!members || members.length === 0) return { nodes: [], edges: [] }

  // Determine root member: prioritized by rootMemberId, else level 0 or first member
  let root = null
  if (rootMemberId) {
    root = members.find(m => m.id === rootMemberId)
  }
  if (!root) {
    root = members.find(m => m.level === 0 || !m.sponsor_id) || members[0]
  }
  if (!root) return { nodes: [], edges: [] }

  // Build parent-to-children mapping
  const childrenMap = new Map()
  members.forEach(m => {
    const parentKey = mode === 'PLACEMENT' ? m.parent_id : m.sponsor_id
    if (parentKey) {
      if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, [])
      childrenMap.get(parentKey).push(m)
    }
  })

  const nodes = []
  const edges = []
  const visited = new Set()

  // Spacious node dimensions & layout gaps
  const NODE_WIDTH = 300
  const NODE_HEIGHT = 185
  const LEVEL_Y_SPACING = 300
  const SIBLING_X_GAP = 120

  // Measure subtree width recursively
  function getSubtreeWidth(nodeId) {
    if (collapsedNodeIds.has(nodeId)) return NODE_WIDTH
    const children = childrenMap.get(nodeId) || []
    if (children.length === 0) return NODE_WIDTH
    const totalChildWidth = children.reduce((sum, c) => sum + getSubtreeWidth(c.id), 0)
    const totalGaps = (children.length - 1) * SIBLING_X_GAP
    return Math.max(NODE_WIDTH, totalChildWidth + totalGaps)
  }

  // Position nodes with generous breathing room
  function layoutNode(member, startX, currentY, depth = 0) {
    if (visited.has(member.id)) return
    visited.add(member.id)

    const isCollapsed = collapsedNodeIds.has(member.id)
    const directChildren = childrenMap.get(member.id) || []
    const hasChildren = directChildren.length > 0
    const subtreeWidth = getSubtreeWidth(member.id)

    // Center this node within its assigned width allocated for its subtree
    const nodeX = startX + (subtreeWidth - NODE_WIDTH) / 2
    const nodeY = currentY

    nodes.push({
      id: member.id,
      type: 'memberNode',
      position: { x: nodeX, y: nodeY },
      data: {
        member,
        mode,
        depth,
        hasChildren,
        childCount: directChildren.length,
        isCollapsed,
      },
    })

    // If root has no children yet, attach an intuitive "Invite First Distributor" action card
    if (depth === 0 && !hasChildren) {
      const inviteId = `invite-${member.id}`
      const inviteY = currentY + LEVEL_Y_SPACING
      nodes.push({
        id: inviteId,
        type: 'inviteNode',
        position: { x: nodeX, y: inviteY },
        data: {
          member,
          referralCode: member.referral_code || member.member_id,
        },
      })

      edges.push({
        id: `e-${member.id}-${inviteId}`,
        source: member.id,
        target: inviteId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#853953',
          strokeWidth: 2.5,
          strokeDasharray: '6 4',
        },
        label: 'Level 1 Position',
        labelStyle: { fill: '#853953', fontSize: 11, fontWeight: 800 },
        labelBgStyle: { fill: '#fff5f7', stroke: '#fbcfe8', strokeWidth: 1, rx: 8, ry: 8 },
        labelBgPadding: [8, 4],
      })
      return
    }

    // Layout children if not collapsed
    if (!isCollapsed && hasChildren) {
      let childStartX = startX
      directChildren.forEach((child) => {
        const childWidth = getSubtreeWidth(child.id)

        // Add edge
        const isLeft = child.position === 'LEFT'
        const isRight = child.position === 'RIGHT'
        const edgeColor = mode === 'PLACEMENT'
          ? (isLeft ? '#10b981' : isRight ? '#3b82f6' : '#853953')
          : '#853953'

        edges.push({
          id: `e-${member.id}-${child.id}`,
          source: member.id,
          target: child.id,
          type: 'smoothstep',
          animated: depth < 2,
          style: {
            stroke: edgeColor,
            strokeWidth: 2.5,
            strokeDasharray: depth >= 2 ? '4 3' : undefined,
          },
          label: mode === 'PLACEMENT' ? (child.position || `L${depth + 1}`) : `Level ${depth + 1}`,
          labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 700 },
          labelBgStyle: { fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1, rx: 6, ry: 6 },
          labelBgPadding: [8, 3],
        })

        layoutNode(child, childStartX, currentY + LEVEL_Y_SPACING, depth + 1)
        childStartX += childWidth + SIBLING_X_GAP
      })
    }
  }

  layoutNode(root, 200, 60, 0)

  return { nodes, edges }
}

/**
 * Sync / Seed handler for database refresh
 */
export async function seedDatabaseDirectly() {
  return await getGenealogyMembers()
}
