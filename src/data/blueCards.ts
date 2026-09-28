import type { Card } from '../game/types';

export const BLUE_CARDS: Card[] = [
  // PREVENTION
  {
    id: 'blue_firewall',
    name: 'Firewall',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 2,
    description: 'Block unauthorized network traffic at the perimeter.',
    educationalDescription: 'Firewalls filter traffic based on rules. Next-gen firewalls add application awareness, IPS, and threat intelligence. Default-deny policies are best practice.',
    requirements: [],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      nodeType: 'FIREWALL',
      value: 3,
      description: 'Strengthen FIREWALL. Blocks SCAN and INITIAL_ACCESS on protected nodes for 2 turns.'
    },
    targetType: 'NODE',
    icon: '🧱',
    color: '#00ff88'
  },
  {
    id: 'blue_waf',
    name: 'Web Application Firewall (WAF)',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 3,
    description: 'Filter malicious HTTP traffic targeting web apps.',
    educationalDescription: 'WAFs inspect HTTP/HTTPS traffic for SQLi, XSS, and other web attacks. They can operate in block or monitor mode. Rule tuning reduces false positives.',
    requirements: [{ type: 'NODE_STATUS', nodeType: 'WEB_SERVER', status: 'SECURE' }],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      nodeType: 'WEB_SERVER',
      value: 4,
      description: 'Protect WEB_SERVER from EXPLOITATION (SQLi, XSS, RCE) for 3 turns.'
    },
    targetType: 'NODE',
    icon: '🛡️',
    color: '#00ff88'
  },
  {
    id: 'blue_mfa',
    name: 'Multi-Factor Authentication (MFA)',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 2,
    description: 'Require additional verification beyond passwords.',
    educationalDescription: 'MFA prevents 99.9% of account compromise attacks. FIDO2/WebAuthn is phishing-resistant. SMS-based MFA is vulnerable to SIM swapping.',
    requirements: [],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      nodeType: 'AUTH_SERVER',
      value: 5,
      description: 'Secure AUTH_SERVER. Blocks Credential Stuffing and Phishing permanently.'
    },
    targetType: 'NODE',
    icon: '🔐',
    color: '#00ff88'
  },
  {
    id: 'blue_patch',
    name: 'Security Patch',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 2,
    description: 'Apply updates to fix known vulnerabilities.',
    educationalDescription: 'Timely patching closes known exploit paths. Automated patch management and testing pipelines reduce exposure windows. Zero-days cannot be patched.',
    requirements: [{ type: 'NODE_STATUS', status: 'VULNERABLE' }],
    effect: {
      type: 'PATCH',
      target: 'NODE',
      value: 1,
      description: 'Change VULNERABLE node to SECURE. Removes compromise level. Cannot stop Zero-Day.'
    },
    targetType: 'NODE',
    icon: '🩹',
    color: '#00ff88'
  },
  {
    id: 'blue_access_control',
    name: 'Access Control',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 2,
    description: 'Enforce least privilege and zero trust principles.',
    educationalDescription: 'Zero Trust assumes breach and verifies every request. Micro-segmentation, continuous authentication, and least privilege limit blast radius.',
    requirements: [],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      value: 2,
      description: 'Reduce compromise level of target node by 2. Prevents lateral movement for 2 turns.'
    },
    targetType: 'NODE',
    icon: '🚫',
    color: '#00ff88'
  },
  {
    id: 'blue_input_validation',
    name: 'Input Validation',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 1,
    description: 'Sanitize all user inputs to prevent injection attacks.',
    educationalDescription: 'Input validation (allowlist, encoding, parameterized queries) prevents injection. It\'s a primary OWASP Top 10 defense. Never trust user input.',
    requirements: [{ type: 'NODE_STATUS', nodeType: 'WEB_SERVER' }],
    effect: {
      type: 'COUNTER',
      target: 'CARD',
      value: 1,
      description: 'Counter EXPLOITATION cards targeting WEB_SERVER. Can be chained as response.'
    },
    targetType: 'CARD',
    icon: '✓',
    color: '#00ff88'
  },
  {
    id: 'blue_rate_limiting',
    name: 'Rate Limiting',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 1,
    description: 'Throttle excessive requests to prevent abuse.',
    educationalDescription: 'Rate limiting prevents brute force, credential stuffing, and DoS. Adaptive limits based on behavior are more effective than static thresholds.',
    requirements: [],
    effect: {
      type: 'COUNTER',
      target: 'CARD',
      value: 1,
      description: 'Counter INITIAL_ACCESS and DDoS cards. Reduces their effect by 50%.'
    },
    targetType: 'CARD',
    icon: '⏱️',
    color: '#00ff88'
  },

  // DETECTION
  {
    id: 'blue_ids',
    name: 'Intrusion Detection System (IDS)',
    team: 'BLUE',
    category: 'DETECTION',
    cost: 2,
    description: 'Monitor network for suspicious activity and alert.',
    educationalDescription: 'IDS (Snort, Suricata) uses signatures and anomalies to detect attacks. It alerts but doesn\'t block. False positives require tuning.',
    requirements: [],
    effect: {
      type: 'REVEAL',
      target: 'NODE',
      value: 2,
      description: 'Reveal all attacker actions on network for 2 turns. Draw 1 card when attack detected.'
    },
    targetType: 'NODE',
    icon: '📡',
    color: '#00aaff'
  },
  {
    id: 'blue_siem',
    name: 'SIEM Alert',
    team: 'BLUE',
    category: 'DETECTION',
    cost: 3,
    description: 'Correlate logs across infrastructure to detect attacks.',
    educationalDescription: 'SIEM aggregates and correlates logs for threat detection. Advanced analytics and UEBA identify subtle attack patterns. Requires log sources and tuning.',
    requirements: [{ type: 'HAS_CARD', cardId: 'blue_ids' }],
    effect: {
      type: 'REVEAL',
      target: 'PLAYER',
      value: 3,
      description: 'Reveal Red\'s hand. Draw 2 cards. Next Red attack costs +2 Energy.'
    },
    targetType: 'PLAYER',
    icon: '📊',
    color: '#00aaff'
  },
  {
    id: 'blue_net_monitoring',
    name: 'Network Monitoring',
    team: 'BLUE',
    category: 'DETECTION',
    cost: 2,
    description: 'Continuous visibility into network traffic flows.',
    educationalDescription: 'NetFlow, Zeek, and PCAP analysis provide network visibility. Encrypted traffic analysis (ETA) detects anomalies without decryption.',
    requirements: [],
    effect: {
      type: 'REVEAL',
      target: 'NODE',
      value: 1,
      description: 'Scan all nodes. Reveal compromise levels. Draw 1 card per COMPROMISED node found. Acts as DLP: playable as a response to DATA EXFILTRATION to block it.'
    },
    targetType: 'NONE',
    icon: '👁️',
    color: '#00aaff'
  },
  {
    id: 'blue_edr',
    name: 'Endpoint Detection & Response (EDR)',
    team: 'BLUE',
    category: 'DETECTION',
    cost: 3,
    description: 'Detect and respond to endpoint threats in real-time.',
    educationalDescription: 'EDR monitors endpoint behavior (processes, network, file) for malicious activity. It enables investigation and automated response. Telemetry is key.',
    requirements: [{ type: 'NODE_STATUS', nodeType: 'ENDPOINT' }],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      nodeType: 'ENDPOINT',
      value: 4,
      damage: 10,
      description: 'Secure ENDPOINT. Detect and block Malware, Credential Dumping, Persistence for 3 turns. Deals 10 damage to RED.'
    },
    targetType: 'NODE',
    icon: '🖥️',
    color: '#00aaff'
  },
  {
    id: 'blue_threat_hunting',
    name: 'Threat Hunting',
    team: 'BLUE',
    category: 'DETECTION',
    cost: 3,
    description: 'Proactively search for hidden threats.',
    educationalDescription: 'Threat hunting assumes compromise and searches for IOCs and TTPs. Hypothesis-driven hunting finds threats automated tools miss.',
    requirements: [{ type: 'TURN_MIN', value: 3 }],
    effect: {
      type: 'REVEAL',
      target: 'PLAYER',
      value: 2,
      damage: 5,
      description: 'Reveal all COMPROMISED nodes. Red loses 2 Energy. Draw 1 card. Deals 5 damage to RED.'
    },
    targetType: 'PLAYER',
    icon: '🔍',
    color: '#00aaff'
  },

  // RESPONSE
  {
    id: 'blue_isolate',
    name: 'Isolate Host',
    team: 'BLUE',
    category: 'CONTAINMENT',
    cost: 2,
    description: 'Disconnect compromised system from network.',
    educationalDescription: 'Network isolation (VLAN quarantine, host firewall) contains lateral movement. Automated isolation via EDR/SOAR reduces dwell time.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'ISOLATE',
      target: 'NODE',
      value: 3,
      description: 'Set node to ISOLATED. Prevents all Red actions on it for 3 turns. Red loses access.'
    },
    targetType: 'NODE',
    icon: '🔌',
    color: '#ffaa00'
  },
  {
    id: 'blue_block_ip',
    name: 'Block IP Address',
    team: 'BLUE',
    category: 'CONTAINMENT',
    cost: 1,
    description: 'Block malicious source IP at firewall.',
    educationalDescription: 'IP blocking stops known malicious sources. Threat intelligence feeds automate this. Attackers rotate IPs, so it\'s temporary.',
    requirements: [],
    effect: {
      type: 'BLOCK',
      target: 'NODE',
      nodeType: 'FIREWALL',
      value: 2,
      damage: 5,
      description: 'Block Red\'s current attack. Red loses 1 Energy. Attack fails. Deals 5 damage to RED.'
    },
    targetType: 'NODE',
    icon: '🚫',
    color: '#ffaa00'
  },
  {
    id: 'blue_revoke_creds',
    name: 'Revoke Credentials',
    team: 'BLUE',
    category: 'RESPONSE',
    cost: 2,
    description: 'Invalidate compromised authentication tokens.',
    educationalDescription: 'Credential rotation and revocation limit attacker access. Short token lifetimes and automated rotation reduce exposure.',
    requirements: [{ type: 'NODE_STATUS', nodeType: 'AUTH_SERVER' }],
    effect: {
      type: 'HEAL',
      target: 'NODE',
      nodeType: 'AUTH_SERVER',
      value: 3,
      description: 'Secure AUTH_SERVER. Remove all Red compromise from it. Red discards 2 cards.'
    },
    targetType: 'NODE',
    icon: '🗝️',
    color: '#ffaa00'
  },
  {
    id: 'blue_incident_response',
    name: 'Incident Response',
    team: 'BLUE',
    category: 'RESPONSE',
    cost: 4,
    description: 'Execute coordinated response to active breach.',
    educationalDescription: 'IR follows NIST/SANS phases: Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned. Playbooks speed response.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'HEAL',
      target: 'NODE',
      value: 4,
      damage: 15,
      description: 'Clean all COMPROMISED nodes. Restore 20% network integrity. Red skips next turn. Deals 15 damage to RED.'
    },
    targetType: 'NONE',
    icon: '🚨',
    color: '#ffaa00'
  },
  {
    id: 'blue_ips',
    name: 'Intrusion Prevention System (IPS)',
    team: 'BLUE',
    category: 'RESPONSE',
    cost: 3,
    description: 'Automatically block detected attacks in real-time.',
    educationalDescription: 'IPS extends IDS with inline blocking. It can stop attacks but risks false positives. Tuning and bypass prevention are critical.',
    requirements: [],
    effect: {
      type: 'COUNTER',
      target: 'CARD',
      value: 2,
      damage: 10,
      description: 'Counter any Red card as response. Chainable. Red must pay +3 Energy to bypass. Deals 10 damage to RED.'
    },
    targetType: 'CARD',
    icon: '⚡',
    color: '#ffaa00'
  },

  // RECOVERY
  {
    id: 'blue_backup',
    name: 'Backup Restore',
    team: 'BLUE',
    category: 'RECOVERY',
    cost: 3,
    description: 'Restore systems from clean, offline backups.',
    educationalDescription: 'Offline, immutable backups are the ultimate ransomware defense. Regular restore testing ensures viability. 3-2-1 backup rule: 3 copies, 2 media, 1 offsite.',
    requirements: [{ type: 'NODE_STATUS', status: 'OFFLINE' }],
    effect: {
      type: 'HEAL',
      target: 'NODE',
      value: 5,
      description: 'Restore OFFLINE node to SECURE. Restore 15% network integrity.'
    },
    targetType: 'NODE',
    icon: '💾',
    color: '#00ffcc'
  },
  {
    id: 'blue_recovery',
    name: 'System Recovery',
    team: 'BLUE',
    category: 'RECOVERY',
    cost: 2,
    description: 'Rebuild and harden compromised systems.',
    educationalDescription: 'Recovery involves rebuilding from known-good images, applying patches, rotating credentials, and verifying integrity. Golden images speed this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'HEAL',
      target: 'NODE',
      value: 3,
      description: 'Change COMPROMISED node to SECURE. Gain 1 Energy.'
    },
    targetType: 'NODE',
    icon: '🔄',
    color: '#00ffcc'
  },

  // DECEPTION
  {
    id: 'blue_honeypot',
    name: 'Honeypot',
    team: 'BLUE',
    category: 'DECEPTION',
    cost: 2,
    description: 'Deploy decoy system to detect and analyze attacks.',
    educationalDescription: 'Honeypots mimic vulnerable systems to attract attackers. They provide early warning, threat intelligence, and waste attacker resources. High-interaction honeypots capture more data.',
    requirements: [],
    effect: {
      type: 'DECOY',
      target: 'NODE',
      value: 2,
      damage: 5,
      description: 'Create decoy node. If Red attacks it: reveal their hand, they lose 2 Energy, you draw 2 cards. Deals 5 damage to RED.'
    },
    targetType: 'NODE',
    icon: '🍯',
    color: '#ff8800'
  },
  {
    id: 'blue_decoy_server',
    name: 'Decoy Server',
    team: 'BLUE',
    category: 'DECEPTION',
    cost: 3,
    description: 'Fake high-value target to divert attacks.',
    educationalDescription: 'Deception technology creates realistic decoys (databases, file shares) that alert on access. It increases attacker cost and reduces dwell time.',
    requirements: [{ type: 'HAS_CARD', cardId: 'blue_honeypot' }],
    effect: {
      type: 'DECOY',
      target: 'NODE',
      value: 3,
      description: 'Create decoy DATABASE. If targeted: Red loses 3 Energy, Blue draws 3 cards, Red\'s turn ends.'
    },
    targetType: 'NODE',
    icon: '🖥️',
    color: '#ff8800'
  },
  {
    id: 'blue_zero_trust',
    name: 'Zero Trust Architecture',
    team: 'BLUE',
    category: 'PREVENTION',
    cost: 4,
    description: 'Never trust, always verify - comprehensive defense.',
    educationalDescription: 'Zero Trust eliminates implicit trust. Every request is authenticated, authorized, and encrypted. Micro-segmentation, continuous verification, and least privilege are core principles.',
    requirements: [{ type: 'TURN_MIN', value: 4 }],
    effect: {
      type: 'BLOCK',
      target: 'PLAYER',
      value: 5,
      description: 'All nodes gain +2 defense. Red\'s cards cost +1 Energy for 3 turns. Draw 2 cards.'
    },
    targetType: 'PLAYER',
    icon: '🔒',
    color: '#00ff88'
  }
];

export function createBlueDeck(): Card[] {
  const deck: Card[] = [];
  BLUE_CARDS.forEach(card => {
    const copies = card.cost <= 2 ? 2 : card.cost <= 4 ? 1 : 1;
    for (let i = 0; i < copies; i++) {
      deck.push({ ...card, id: `${card.id}_${i}` });
    }
  });
  return shuffleDeck(deck);
}

function shuffleDeck<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}