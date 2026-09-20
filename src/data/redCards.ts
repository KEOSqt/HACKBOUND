import type { Card } from '../game/types';

export const RED_CARDS: Card[] = [
  // RECONNAISSANCE
  {
    id: 'red_net_scan',
    name: 'Network Scan',
    team: 'RED',
    category: 'RECONNAISSANCE',
    cost: 1,
    description: 'Discover all directly connected network nodes.',
    educationalDescription: 'Network scanning identifies live hosts, open ports, and services on a network. It\'s typically the first step in reconnaissance.',
    requirements: [],
    effect: {
      type: 'SCAN',
      target: 'NODE',
      value: 1,
      description: 'Reveal all adjacent nodes from INTERNET. Changes SECURE nodes to SCANNED.'
    },
    targetType: 'NODE',
    icon: '🔍',
    color: '#00ffff'
  },
  {
    id: 'red_port_scan',
    name: 'Port Scan',
    team: 'RED',
    category: 'RECONNAISSANCE',
    cost: 1,
    description: 'Deep scan a discovered node to find vulnerabilities.',
    educationalDescription: 'Port scanning probes specific ports on a target to identify running services and potential entry points.',
    requirements: [{ type: 'NODE_STATUS', status: 'SCANNED' }],
    effect: {
      type: 'SCAN',
      target: 'NODE',
      value: 2,
      description: 'Change a SCANNED node to VULNERABLE. Reveals services running on target.'
    },
    targetType: 'NODE',
    icon: '📡',
    color: '#00ffff'
  },
  {
    id: 'red_vuln_scan',
    name: 'Vulnerability Scan',
    team: 'RED',
    category: 'RECONNAISSANCE',
    cost: 2,
    description: 'Automated scan that reveals all weaknesses in a network segment.',
    educationalDescription: 'Vulnerability scanners automatically identify known security flaws (CVEs) in systems and applications.',
    requirements: [{ type: 'NODE_STATUS', status: 'SCANNED' }],
    effect: {
      type: 'SCAN',
      target: 'NODE',
      value: 3,
      description: 'Change a SCANNED node to VULNERABLE. Draw 1 card.'
    },
    targetType: 'NODE',
    icon: '🛡️',
    color: '#00ffff'
  },
  {
    id: 'red_service_enum',
    name: 'Service Enumeration',
    team: 'RED',
    category: 'RECONNAISSANCE',
    cost: 2,
    description: 'Detailed analysis of a vulnerable service to plan exploitation.',
    educationalDescription: 'Service enumeration gathers detailed information about a specific service version and configuration to find exploit paths.',
    requirements: [{ type: 'NODE_STATUS', status: 'VULNERABLE' }],
    effect: {
      type: 'REVEAL',
      target: 'NODE',
      value: 1,
      description: 'Target VULNERABLE node gains +2 compromise level. Draw 1 card.'
    },
    targetType: 'NODE',
    icon: '📋',
    color: '#00ffff'
  },

  // INITIAL ACCESS
  {
    id: 'red_phishing',
    name: 'Phishing Campaign',
    team: 'RED',
    category: 'INITIAL_ACCESS',
    cost: 2,
    description: 'Target human elements to gain initial credentials.',
    educationalDescription: 'Phishing uses social engineering to trick users into revealing credentials or installing malware. It bypasses technical controls by targeting people.',
    requirements: [],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'ENDPOINT',
      value: 2,
      description: 'Compromise an ENDPOINT node directly. Bypasses FIREWALL.'
    },
    targetType: 'NODE',
    icon: '🎣',
    color: '#ff6b00'
  },
  {
    id: 'red_cred_stuffing',
    name: 'Credential Stuffing',
    team: 'RED',
    category: 'INITIAL_ACCESS',
    cost: 2,
    description: 'Use leaked credentials to access authentication systems.',
    educationalDescription: 'Credential stuffing automates login attempts using username/password pairs from data breaches. MFA effectively prevents this.',
    requirements: [],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'AUTH_SERVER',
      value: 3,
      description: 'Attempt to compromise AUTH_SERVER. Blocked if MFA active.'
    },
    targetType: 'NODE',
    icon: '🔑',
    color: '#ff6b00'
  },
  {
    id: 'red_exploit_public',
    name: 'Exploit Public-Facing App',
    team: 'RED',
    category: 'INITIAL_ACCESS',
    cost: 3,
    description: 'Exploit a vulnerability in a public web application.',
    educationalDescription: 'Public-facing applications are common targets. Unpatched vulnerabilities (like Log4Shell) allow remote code execution without authentication.',
    requirements: [{ type: 'NODE_STATUS', status: 'VULNERABLE', nodeType: 'WEB_SERVER' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'WEB_SERVER',
      value: 3,
      description: 'Compromise a VULNERABLE WEB_SERVER. Creates foothold.'
    },
    targetType: 'NODE',
    icon: '🌐',
    color: '#ff6b00'
  },

  // EXPLOITATION
  {
    id: 'red_sql_injection',
    name: 'SQL Injection',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 3,
    description: 'Inject malicious SQL to manipulate database queries.',
    educationalDescription: 'SQL injection occurs when user input is improperly sanitized, allowing attackers to execute arbitrary database commands. Parameterized queries prevent this.',
    requirements: [
      { type: 'NODE_STATUS', status: 'COMPROMISED', nodeType: 'WEB_SERVER' },
      { type: 'NODE_STATUS', status: 'SECURE', nodeType: 'DATABASE' }
    ],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'DATABASE',
      value: 4,
      description: 'Compromise DATABASE through compromised WEB_SERVER. Blocked by WAF.'
    },
    targetType: 'NODE',
    icon: '💉',
    color: '#ff0040'
  },
  {
    id: 'red_xss',
    name: 'Cross-Site Scripting (XSS)',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 2,
    description: 'Inject malicious scripts into trusted web pages.',
    educationalDescription: 'XSS allows attackers to execute scripts in victims\' browsers. It can steal sessions, deface sites, or deliver malware. Content Security Policy mitigates this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED', nodeType: 'WEB_SERVER' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'ENDPOINT',
      value: 2,
      description: 'Compromise ENDPOINT via compromised WEB_SERVER. Steals session tokens.'
    },
    targetType: 'NODE',
    icon: '📜',
    color: '#ff0040'
  },
  {
    id: 'red_cmd_injection',
    name: 'Command Injection',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 3,
    description: 'Execute arbitrary system commands through vulnerable input.',
    educationalDescription: 'Command injection occurs when applications pass unsanitized user input to system shells. It provides direct OS-level access.',
    requirements: [{ type: 'NODE_STATUS', status: 'VULNERABLE', nodeType: 'APP_SERVER' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      nodeType: 'APP_SERVER',
      value: 4,
      description: 'Fully compromise APP_SERVER. Grants system-level access.'
    },
    targetType: 'NODE',
    icon: '💻',
    color: '#ff0040'
  },
  {
    id: 'red_rce',
    name: 'Remote Code Execution',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 5,
    description: 'Achieve full remote control over a vulnerable system.',
    educationalDescription: 'RCE vulnerabilities allow attackers to execute arbitrary code on a target machine. They are among the most severe vulnerabilities (CVSS 9-10).',
    requirements: [{ type: 'NODE_STATUS', status: 'VULNERABLE' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 5,
      description: 'Fully compromise any VULNERABLE node. Maximum impact.'
    },
    targetType: 'NODE',
    icon: '☠️',
    color: '#ff0040'
  },

  // PRIVILEGE ESCALATION
  {
    id: 'red_priv_esc',
    name: 'Privilege Escalation',
    team: 'RED',
    category: 'PRIVILEGE_ESCALATION',
    cost: 3,
    description: 'Elevate from user to admin/root privileges.',
    educationalDescription: 'Privilege escalation exploits misconfigurations or kernel vulnerabilities to gain higher permissions. Regular patching and least privilege prevent this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 2,
      description: 'Increase compromise level of a COMPROMISED node by 2. Unlocks lateral movement.'
    },
    targetType: 'NODE',
    icon: '⬆️',
    color: '#ffaa00'
  },
  {
    id: 'red_cred_dump',
    name: 'Credential Dumping',
    team: 'RED',
    category: 'PRIVILEGE_ESCALATION',
    cost: 3,
    description: 'Extract credentials from memory (LSASS, SAM, etc.).',
    educationalDescription: 'Tools like Mimikatz extract plaintext passwords and hashes from memory. Protected Process Light (PPL) and Credential Guard mitigate this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }, { type: 'ENERGY_MIN', value: 4 }],
    effect: {
      type: 'DRAW',
      target: 'PLAYER',
      value: 2,
      description: 'Draw 2 cards. Compromised node gains +1 compromise level.'
    },
    targetType: 'NONE',
    icon: '💾',
    color: '#ffaa00'
  },
  {
    id: 'red_token_theft',
    name: 'Token Theft',
    team: 'RED',
    category: 'PRIVILEGE_ESCALATION',
    cost: 2,
    description: 'Steal authentication tokens to impersonate users.',
    educationalDescription: 'Session tokens, JWTs, and Kerberos tickets can be stolen and reused. Short expiry and token binding reduce risk.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED', nodeType: 'AUTH_SERVER' }],
    effect: {
      type: 'ENERGY',
      target: 'PLAYER',
      value: 2,
      description: 'Gain 2 Energy. Draw 1 card.'
    },
    targetType: 'NONE',
    icon: '🎫',
    color: '#ffaa00'
  },

  // LATERAL MOVEMENT
  {
    id: 'red_pass_hash',
    name: 'Pass-the-Hash',
    team: 'RED',
    category: 'LATERAL_MOVEMENT',
    cost: 3,
    description: 'Use NTLM hashes to authenticate without cracking passwords.',
    educationalDescription: 'Pass-the-hash uses stolen password hashes directly for authentication. Restricting NTLM and using Kerberos with AES prevents this.',
    requirements: [
      { type: 'NODE_STATUS', status: 'COMPROMISED' },
      { type: 'HAS_CARD', cardId: 'red_cred_dump' }
    ],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 3,
      description: 'Compromise adjacent node without scanning. Requires Credential Dumping.'
    },
    targetType: 'NODE',
    icon: '🔐',
    color: '#aa00ff'
  },
  {
    id: 'red_remote_service',
    name: 'Remote Service Abuse',
    team: 'RED',
    category: 'LATERAL_MOVEMENT',
    cost: 3,
    description: 'Exploit SMB, RDP, SSH, or WinRM for lateral movement.',
    educationalDescription: 'Exposed administrative services (SMB, RDP, SSH) allow lateral movement if credentials are compromised. Network segmentation and jump hosts limit this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 3,
      description: 'Compromise connected node. Blocked by network segmentation.'
    },
    targetType: 'NODE',
    icon: '🔗',
    color: '#aa00ff'
  },
  {
    id: 'red_network_pivot',
    name: 'Network Pivot',
    team: 'RED',
    category: 'LATERAL_MOVEMENT',
    cost: 4,
    description: 'Route traffic through compromised hosts to reach isolated networks.',
    educationalDescription: 'Pivoting uses a compromised host as a proxy to access otherwise unreachable network segments. Strict egress filtering detects this.',
    requirements: [
      { type: 'NODE_STATUS', status: 'COMPROMISED', nodeType: 'APP_SERVER' }
    ],
    effect: {
      type: 'REVEAL',
      target: 'NODE',
      nodeType: 'DATABASE',
      value: 2,
      description: 'Reveal and scan DATABASE through compromised APP_SERVER. Draw 1 card.'
    },
    targetType: 'NODE',
    icon: '🔄',
    color: '#aa00ff'
  },

  // IMPACT
  {
    id: 'red_data_exfil',
    name: 'Data Exfiltration',
    team: 'RED',
    category: 'IMPACT',
    cost: 6,
    description: 'Steal sensitive data from compromised database.',
    educationalDescription: 'Data exfiltration is the unauthorized transfer of data. DLP, encryption, and egress monitoring detect and prevent large data transfers.',
    requirements: [
      { type: 'NODE_STATUS', status: 'COMPROMISED', nodeType: 'DATABASE' },
      { type: 'ENERGY_MIN', value: 6 }
    ],
    effect: {
      type: 'EXFILTRATE',
      target: 'NODE',
      nodeType: 'SENSITIVE_DATA',
      value: 100,
      description: 'WIN CONDITION: Exfiltrate SENSITIVE_DATA. Game ends immediately.'
    },
    targetType: 'NODE',
    icon: '📤',
    color: '#ff0000'
  },
  {
    id: 'red_ddos',
    name: 'DDoS Attack',
    team: 'RED',
    category: 'IMPACT',
    cost: 4,
    description: 'Flood target with traffic to deny service.',
    educationalDescription: 'DDoS overwhelms resources with volumetric or application-layer traffic. CDNs, rate limiting, and scrubbing centers provide mitigation.',
    requirements: [{ type: 'NODE_STATUS', status: 'SCANNED' }],
    effect: {
      type: 'DAMAGE',
      target: 'NODE',
      value: 3,
      description: 'Set node status to OFFLINE for 2 turns. Reduces network integrity by 15%.'
    },
    targetType: 'NODE',
    icon: '🌊',
    color: '#ff0000'
  },
  {
    id: 'red_ransomware',
    name: 'Ransomware Deployment',
    team: 'RED',
    category: 'IMPACT',
    cost: 5,
    description: 'Encrypt critical systems and demand ransom.',
    educationalDescription: 'Ransomware encrypts files and demands payment. Offline backups, application allowlisting, and EDR are critical defenses.',
    requirements: [
      { type: 'NODE_STATUS', status: 'COMPROMISED' },
      { type: 'ENERGY_MIN', value: 5 }
    ],
    effect: {
      type: 'DESTROY',
      target: 'NODE',
      value: 5,
      description: 'Set node to OFFLINE permanently. Reduces network integrity by 25%. Draw 2 cards.'
    },
    targetType: 'NODE',
    icon: '🔒',
    color: '#ff0000'
  },
  {
    id: 'red_zero_day',
    name: 'Zero-Day Exploit',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 6,
    description: 'Exploit an unknown vulnerability with no patch available.',
    educationalDescription: 'Zero-days are vulnerabilities unknown to vendors. They are extremely valuable and rare. Defense-in-depth is the only mitigation.',
    requirements: [{ type: 'NODE_STATUS', status: 'SECURE' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 5,
      description: 'Compromise any SECURE node directly. Cannot be blocked by PATCH.'
    },
    targetType: 'NODE',
    icon: '💎',
    color: '#ff0040'
  },
  {
    id: 'red_exploit_chain',
    name: 'Exploit Chain',
    team: 'RED',
    category: 'EXPLOITATION',
    cost: 4,
    description: 'Combine multiple vulnerabilities for greater impact.',
    educationalDescription: 'Exploit chains combine multiple lower-severity vulnerabilities to achieve high impact. Each link must be patched to break the chain.',
    requirements: [
      { type: 'NODE_STATUS', status: 'VULNERABLE' },
      { type: 'HAS_CARD', cardId: 'red_service_enum' }
    ],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 4,
      description: 'Compromise VULNERABLE node. If target is WEB_SERVER, also compromise APP_SERVER.'
    },
    targetType: 'NODE',
    icon: '⛓️',
    color: '#ff0040'
  },
  {
    id: 'red_persistence',
    name: 'Establish Persistence',
    team: 'RED',
    category: 'PRIVILEGE_ESCALATION',
    cost: 2,
    description: 'Maintain access across reboots and remediation.',
    educationalDescription: 'Persistence mechanisms (scheduled tasks, registry keys, services) survive reboots. File integrity monitoring and immutable infrastructure detect this.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'ENERGY',
      target: 'PLAYER',
      value: 1,
      description: 'Gain 1 Energy at start of each turn while node remains COMPROMISED.'
    },
    targetType: 'NONE',
    icon: '🪝',
    color: '#ffaa00'
  },
  {
    id: 'red_malware',
    name: 'Malware Deployment',
    team: 'RED',
    category: 'IMPACT',
    cost: 4,
    description: 'Deploy custom malware for persistent access.',
    educationalDescription: 'Malware provides remote access, keylogging, and data theft. Behavioral analysis and ML-based EDR detect unknown malware.',
    requirements: [{ type: 'NODE_STATUS', status: 'COMPROMISED' }],
    effect: {
      type: 'COMPROMISE',
      target: 'NODE',
      value: 2,
      description: 'Increase compromise by 2. Node cannot be ISOLATED for 2 turns.'
    },
    targetType: 'NODE',
    icon: '🦠',
    color: '#ff0000'
  }
];

export function createRedDeck(): Card[] {
  const deck: Card[] = [];
  RED_CARDS.forEach(card => {
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