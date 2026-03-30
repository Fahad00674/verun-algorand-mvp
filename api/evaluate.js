const { evaluateAgent } = require('../src/evaluate');
const { anchorEvaluation } = require('../src/anchor');

const safeJson = (obj) => JSON.parse(JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)));

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { agentId = 'agent', score = 0, operation = 'read' } = req.body || {};
    const verdict = evaluateAgent({ agentId, score: Number(score), operation });
    const anchor = await anchorEvaluation({
      type: 'verun-evaluation',
      agentId,
      score: Number(score),
      operation,
      consensus: verdict.consensus,
      permitted: verdict.permitted,
      ts: verdict.ts
    });
    res.status(200).json(safeJson({ success: true, verdict, anchor }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || String(e) });
  }
};
