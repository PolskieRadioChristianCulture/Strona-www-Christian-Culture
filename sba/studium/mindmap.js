/**
 * mindmap.js — Interaktywna Mapa myśli dla Etapu 07 „Twórz”.
 * Obsługuje węzły, gałęzie, połączenia (edges), odnośniki wersetów, notatki,
 * eksport SVG i PNG oraz pełny tekstowy widok konspektu dla czytników ekranu.
 */

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createDefaultMindMap(passageLabel = 'Fragment') {
  return {
    nodes: [
      { id: 'root', parentId: null, label: passageLabel, verseRef: passageLabel, note: 'Temat główny studium', color: '#b71933' }
    ],
    edges: []
  };
}

export function addBranchNode(mindMap, { parentId = 'root', label, verseRef = '', note = '', color = '#121212' }) {
  const cleanLabel = String(label || '').trim();
  if (!cleanLabel) return { mindMap, added: null };
  const targetParent = mindMap.nodes.some((n) => n.id === parentId) ? parentId : 'root';
  const id = `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const node = {
    id,
    parentId: targetParent,
    label: cleanLabel.slice(0, 140),
    verseRef: String(verseRef || '').trim().slice(0, 80),
    note: String(note || '').trim().slice(0, 800),
    color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#121212'
  };
  const next = {
    nodes: [...mindMap.nodes, node],
    edges: [...mindMap.edges]
  };
  return { mindMap: next, added: node };
}

export function updateBranchNode(mindMap, nodeId, patch) {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((n) => (n.id === nodeId
      ? {
        ...n,
        label: patch.label !== undefined ? String(patch.label).trim().slice(0, 140) || n.label : n.label,
        verseRef: patch.verseRef !== undefined ? String(patch.verseRef).trim().slice(0, 80) : n.verseRef,
        note: patch.note !== undefined ? String(patch.note).trim().slice(0, 800) : n.note,
        color: patch.color && /^#[0-9a-fA-F]{6}$/.test(patch.color) ? patch.color : n.color
      }
      : n))
  };
}

export function removeBranchNode(mindMap, nodeId) {
  if (!nodeId || nodeId === 'root') return mindMap;
  const toDelete = new Set([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of mindMap.nodes) {
      if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
        toDelete.add(n.id);
        changed = true;
      }
    }
  }
  return {
    nodes: mindMap.nodes.filter((n) => !toDelete.has(n.id)),
    edges: mindMap.edges.filter((e) => !toDelete.has(e.from) && !toDelete.has(e.to))
  };
}

export function addMindMapEdge(mindMap, fromId, toId, label = '') {
  if (!fromId || !toId || fromId === toId) return mindMap;
  const ids = new Set(mindMap.nodes.map((n) => n.id));
  if (!ids.has(fromId) || !ids.has(toId)) return mindMap;
  if (mindMap.edges.some((e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId))) return mindMap;
  return {
    ...mindMap,
    edges: [...mindMap.edges, { id: `edge_${Date.now().toString(36)}`, from: fromId, to: toId, label: String(label || '').trim().slice(0, 60) }]
  };
}

export function removeMindMapEdge(mindMap, edgeId) {
  return { ...mindMap, edges: mindMap.edges.filter((e) => e.id !== edgeId) };
}

function computeRadialLayout(mindMap) {
  const width = 920;
  const height = 580;
  const cx = width / 2;
  const cy = height / 2;
  const coords = new Map();
  const root = mindMap.nodes.find((n) => n.id === 'root') || mindMap.nodes[0];
  if (!root) return { width, height, coords };
  coords.set(root.id, { x: cx, y: cy, depth: 0 });

  const childrenMap = new Map();
  for (const node of mindMap.nodes) {
    if (node.id === root.id) continue;
    const p = coords.has(node.parentId) || mindMap.nodes.some((m) => m.id === node.parentId) ? node.parentId : root.id;
    const list = childrenMap.get(p) || [];
    list.push(node);
    childrenMap.set(p, list);
  }

  const level1 = childrenMap.get(root.id) || [];
  const count1 = Math.max(1, level1.length);
  level1.forEach((child, idx) => {
    const angle = ((Math.PI * 2) / count1) * idx - Math.PI / 2;
    const r1 = 178;
    const x = Math.max(105, Math.min(width - 105, cx + Math.cos(angle) * r1));
    const y = Math.max(60, Math.min(height - 60, cy + Math.sin(angle) * r1));
    coords.set(child.id, { x, y, depth: 1, angle });

    const sub = childrenMap.get(child.id) || [];
    sub.forEach((grand, gIdx) => {
      const spread = sub.length > 1 ? ((gIdx - (sub.length - 1) / 2) * 0.45) : 0;
      const gAngle = angle + spread;
      const r2 = 128;
      const gx = Math.max(92, Math.min(width - 92, x + Math.cos(gAngle) * r2));
      const gy = Math.max(46, Math.min(height - 46, y + Math.sin(gAngle) * r2));
      coords.set(grand.id, { x: gx, y: gy, depth: 2, angle: gAngle });
    });
  });

  // Fallback for deeper nodes (depth >= 3)
  let orphanIdx = 0;
  for (const node of mindMap.nodes) {
    if (!coords.has(node.id)) {
      const pPos = coords.get(node.parentId) || { x: cx, y: cy };
      const a = 0.6 * orphanIdx++;
      coords.set(node.id, {
        x: Math.max(90, Math.min(width - 90, pPos.x + Math.cos(a) * 95)),
        y: Math.max(45, Math.min(height - 45, pPos.y + Math.sin(a) * 95)),
        depth: 3
      });
    }
  }
  return { width, height, coords };
}

function truncate(str, max) {
  const s = String(str || '');
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function buildMindMapSvgString(mindMap, { selectedId = null } = {}) {
  const { width, height, coords } = computeRadialLayout(mindMap);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Mapa myśli studium biblijnego">`,
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" rx="16"/>`
  ];

  // Parent-child lines
  for (const node of mindMap.nodes) {
    if (!node.parentId) continue;
    const p1 = coords.get(node.parentId);
    const p2 = coords.get(node.id);
    if (!p1 || !p2) continue;
    const mx = (p1.x + p2.x) / 2;
    parts.push(`<path d="M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${mx.toFixed(1)} ${p1.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}" fill="none" stroke="#c8c0bf" stroke-width="2.2"/>`);
  }

  // Custom edges
  for (const edge of mindMap.edges) {
    const p1 = coords.get(edge.from);
    const p2 = coords.get(edge.to);
    if (!p1 || !p2) continue;
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 - 14;
    parts.push(`<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#b71933" stroke-width="2" stroke-dasharray="6 4"/>`);
    if (edge.label) {
      parts.push(`<rect x="${(mx - 48).toFixed(1)}" y="${(my - 11).toFixed(1)}" width="96" height="20" rx="6" fill="#fdecef" stroke="#b71933" stroke-width="1"/>`);
      parts.push(`<text x="${mx.toFixed(1)}" y="${(my + 3).toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8f1227">${escapeXml(truncate(edge.label, 16))}</text>`);
    }
  }

  // Nodes
  for (const node of mindMap.nodes) {
    const pos = coords.get(node.id);
    if (!pos) continue;
    const isRoot = node.id === 'root';
    const isSel = node.id === selectedId;
    const boxW = isRoot ? 190 : 164;
    const boxH = node.verseRef ? 54 : 42;
    const x = pos.x - boxW / 2;
    const y = pos.y - boxH / 2;
    const fill = isRoot ? '#b71933' : '#ffffff';
    const stroke = isSel ? '#b71933' : (isRoot ? '#8f1227' : (node.color || '#121212'));
    const strokeWidth = isSel ? 3 : 2;
    const fg = isRoot ? '#ffffff' : '#121212';
    const subFg = isRoot ? '#ffe7eb' : '#b71933';

    parts.push(`<g data-node-id="${escapeXml(node.id)}" class="mm-node" tabindex="0" role="button" aria-label="${escapeXml(node.label)}">`);
    parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${boxW}" height="${boxH}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`);
    const titleY = node.verseRef ? pos.y - 4 : pos.y + 4;
    parts.push(`<text x="${pos.x.toFixed(1)}" y="${titleY.toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${isRoot ? 14 : 13}" font-weight="700" fill="${fg}">${escapeXml(truncate(node.label, 22))}</text>`);
    if (node.verseRef && !isRoot) {
      parts.push(`<text x="${pos.x.toFixed(1)}" y="${(pos.y + 15).toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="${subFg}">${escapeXml(truncate(node.verseRef, 22))}</text>`);
    } else if (node.verseRef && isRoot) {
      parts.push(`<text x="${pos.x.toFixed(1)}" y="${(pos.y + 15).toFixed(1)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="${subFg}">${escapeXml(truncate(node.verseRef, 24))}</text>`);
    }
    parts.push('</g>');
  }

  parts.push('</svg>');
  return parts.join('');
}

export function buildMindMapTextOutline(mindMap) {
  const lines = [];
  const childrenMap = new Map();
  for (const n of mindMap.nodes) {
    const p = n.parentId || '__ROOT__';
    const arr = childrenMap.get(p) || [];
    arr.push(n);
    childrenMap.set(p, arr);
  }
  const walk = (parentId, depth) => {
    for (const node of childrenMap.get(parentId) || []) {
      const indent = '  '.repeat(depth);
      const refPart = node.verseRef ? ` [${node.verseRef}]` : '';
      const notePart = node.note ? ` — ${node.note}` : '';
      lines.push(`${indent}- ${node.label}${refPart}${notePart}`);
      walk(node.id, depth + 1);
    }
  };
  walk('__ROOT__', 0);
  if (mindMap.edges.length) {
    lines.push('', 'Połączenia dodatkowe:');
    const byId = new Map(mindMap.nodes.map((n) => [n.id, n.label]));
    for (const e of mindMap.edges) {
      lines.push(`  • ${byId.get(e.from) || e.from} → ${byId.get(e.to) || e.to}${e.label ? ` (${e.label})` : ''}`);
    }
  }
  return lines.join('\n');
}

export function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 500);
}

export async function exportMindMapPng(mindMap, filename = 'mapa-mysli-studium.png') {
  const svgStr = buildMindMapSvgString(mindMap);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 920 * scale;
    canvas.height = 580 * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (pngBlob) triggerFileDownload(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
