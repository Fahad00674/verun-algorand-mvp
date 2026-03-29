const fs = require('fs');
const path = require('path');

const validators = JSON.parse(fs.readFileSync(path.join(__dirname, 'validators.json'), 'utf8'));

function scoreToTier(score) {
  if (score >= 800) return 'LOW';
  if (score >= 600) return 'MED';
  if (score >= 300) return 'HIGH';
  return 'BLOCK';
}

function permittedByOperation(score, operation = 'read') {
  const req = { read: 300, transfer: 500, mint: 500, order: 600 };
  return score >= (req[operation] ?? 300);
}

function kickbackRate(score) {
  if (score >= 800) return 10;
  if (score >= 500) return 5;
  return 0;
}

function validatorVote(validatorId, score, operation) {
  const permitted = permittedByOperation(score, operation);
  if (!permitted) return { validatorId, vote: 'BLOCK', reason: 'threshold_not_met' };
  return { validatorId, vote: scoreToTier(score), reason: 'score_based_policy' };
}

function evaluateAgent({ agentId, score, operation = 'read' }) {
  const votes = validators.map(v => validatorVote(v.id, score, operation));
  const tally = votes.reduce((acc, v) => {
    acc[v.vote] = (acc[v.vote] || 0) + 1;
    return acc;
  }, {});

  let consensus = 'BLOCK';
  for (const t of ['LOW', 'MED', 'HIGH', 'BLOCK']) {
    if ((tally[t] || 0) >= 2) {
      consensus = t;
      break;
    }
  }

  return {
    agentId,
    score,
    operation,
    votes,
    tally,
    consensus,
    permitted: consensus !== 'BLOCK',
    kickback_rate: kickbackRate(score),
    ts: new Date().toISOString()
  };
}

if (require.main === module) {
  console.log(JSON.stringify(evaluateAgent({ agentId: 'agent-demo', score: 820, operation: 'transfer' }), null, 2));
}

module.exports = { evaluateAgent, scoreToTier, permittedByOperation, kickbackRate };
