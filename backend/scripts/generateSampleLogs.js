const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path to backend root and models
const Log = require('../src/models/Log');
const config = require('../src/config/env');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    rows: 5000,
    out: path.join(__dirname, '..', 'sample_logs.csv'),
    insert: false
  };

  args.forEach((arg) => {
    if (arg.startsWith('--rows=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!isNaN(val) && val > 0) options.rows = val;
    } else if (arg.startsWith('--out=')) {
      options.out = path.resolve(arg.split('=')[1]);
    } else if (arg === '--insert') {
      options.insert = true;
    }
  });

  return options;
};

// Seed Data
const NORMAL_USERS = [
  'alice.chen',
  'bob.miller',
  'charlie.davis',
  'diana.ross',
  'evan.wright',
  'frank.castle',
  'grace.hopper',
  'helen.troy',
  'ian.somers',
  'julia.roberts',
  'kevin.mitnick',
  'laura.croft',
  'michael.scott',
  'nancy.wheeler',
  'oscar.martinez'
];

const NORMAL_IPS = [
  '192.168.1.15',
  '192.168.1.22',
  '192.168.1.45',
  '192.168.1.88',
  '192.168.1.104',
  '10.0.4.12',
  '10.0.4.35',
  '10.0.4.78',
  '10.0.4.110',
  '172.16.10.4',
  '172.16.10.18',
  '172.16.10.99'
];

const ANOMALOUS_IPS = [
  '185.220.101.5',
  '198.51.100.44',
  '203.0.113.89',
  '45.33.32.156',
  '194.26.29.112',
  '103.251.167.20'
];

const NORMAL_RESOURCES = [
  '/api/v1/dashboard',
  '/api/v1/profile',
  '/documents/quarterly_report.pdf',
  '/shared/engineering/specs.docx',
  '/api/data/records',
  '/web/home',
  '/auth/login',
  '/api/search?q=reports'
];

const SENSITIVE_RESOURCES = [
  '/etc/shadow',
  '/var/secrets/api_keys.env',
  '/backup/customer_data.tar.gz',
  '/admin/roles/grant',
  '/sudo/elevate',
  '/.env',
  '/root/.ssh/id_rsa'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
];

const ANOMALOUS_USER_AGENTS = [
  'sqlmap/1.7.2#stable (https://sqlmap.org)',
  'Nikto/2.1.6',
  'python-requests/2.31.0',
  'curl/7.88.1'
];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateLogDataset = (totalRows) => {
  const anomalyCount = Math.floor(totalRows * 0.03); // ~3% injected anomalies
  const normalCount = totalRows - anomalyCount;

  const logs = [];
  const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // Past 7 days

  // 1. Generate Normal Logs (97%)
  for (let i = 0; i < normalCount; i++) {
    // Business hours bias: 8:00 AM to 7:00 PM UTC
    const dayOffset = Math.random() * 7 * 24 * 60 * 60 * 1000;
    const logDate = new Date(baseTime + dayOffset);
    // Align hour mostly between 8 and 19
    const hour = Math.random() > 0.15 ? randomInt(8, 19) : randomInt(7, 22);
    logDate.setUTCHours(hour, randomInt(0, 59), randomInt(0, 59), randomInt(0, 999));

    const eventRoll = Math.random();
    let eventType = 'file_access';
    let statusCode = 200;
    let resource = randomChoice(NORMAL_RESOURCES);
    let message = 'Action completed successfully';

    if (eventRoll < 0.55) {
      eventType = 'login_success';
      statusCode = 200;
      resource = '/auth/login';
      message = 'User authenticated successfully';
    } else if (eventRoll < 0.75) {
      eventType = 'file_access';
      statusCode = 200;
      resource = randomChoice(NORMAL_RESOURCES);
      message = 'File accessed by authorized user';
    } else if (eventRoll < 0.88) {
      eventType = 'login_failed';
      statusCode = 401;
      resource = '/auth/login';
      message = 'Invalid password provided';
    } else if (eventRoll < 0.95) {
      eventType = 'access_denied';
      statusCode = 403;
      resource = '/finance/restricted';
      message = 'Insufficient permissions for resource';
    } else {
      eventType = 'system_error';
      statusCode = 500;
      resource = '/api/internal/service';
      message = 'Internal connection reset';
    }

    logs.push({
      timestamp: logDate.toISOString(),
      sourceIp: randomChoice(NORMAL_IPS),
      username: randomChoice(NORMAL_USERS),
      eventType,
      statusCode,
      resource,
      userAgent: randomChoice(USER_AGENTS),
      message,
      isAnomaly: false
    });
  }

  // 2. Generate Injected Anomalies (~3%)
  const anomalyGenerators = [
    // Anomaly Type A: Brute Force Login Bursts (Rapid failures from single IP)
    () => {
      const burstSize = randomInt(15, 30);
      const attackerIp = randomChoice(ANOMALOUS_IPS);
      const targetUser = randomChoice(['admin', 'root', 'administrator', 'alice.chen']);
      const burstTime = new Date(baseTime + Math.random() * 7 * 24 * 60 * 60 * 1000);
      const subLogs = [];

      for (let j = 0; j < burstSize; j++) {
        const entryTime = new Date(burstTime.getTime() + j * randomInt(500, 2500));
        subLogs.push({
          timestamp: entryTime.toISOString(),
          sourceIp: attackerIp,
          username: targetUser,
          eventType: 'login_failed',
          statusCode: 401,
          resource: '/auth/login',
          userAgent: randomChoice(ANOMALOUS_USER_AGENTS),
          message: 'Brute-force attempt: rapid password guess rejected',
          isAnomaly: true
        });
      }
      return subLogs;
    },

    // Anomaly Type B: Off-Hours Sensitive Data Access
    () => {
      const offHourDate = new Date(baseTime + Math.random() * 7 * 24 * 60 * 60 * 1000);
      offHourDate.setUTCHours(randomInt(2, 4), randomInt(1, 59), randomInt(0, 59));

      return [
        {
          timestamp: offHourDate.toISOString(),
          sourceIp: randomChoice(ANOMALOUS_IPS),
          username: randomChoice(NORMAL_USERS),
          eventType: 'file_access',
          statusCode: 200,
          resource: randomChoice(SENSITIVE_RESOURCES),
          userAgent: randomChoice(USER_AGENTS),
          message: 'Off-hours access to restricted system vault',
          isAnomaly: true
        }
      ];
    },

    // Anomaly Type C: Privilege Escalation Attempt
    () => {
      const escTime = new Date(baseTime + Math.random() * 7 * 24 * 60 * 60 * 1000);
      return [
        {
          timestamp: escTime.toISOString(),
          sourceIp: randomChoice(ANOMALOUS_IPS),
          username: randomChoice(['contractor_temp', 'guest_svc', 'intern_bob']),
          eventType: 'privilege_change',
          statusCode: 200,
          resource: '/admin/roles/grant',
          userAgent: randomChoice(ANOMALOUS_USER_AGENTS),
          message: 'Unauthorized privilege escalation: granted admin permissions',
          isAnomaly: true
        }
      ];
    },

    // Anomaly Type D: Automated Vulnerability Scanner
    () => {
      const scanTime = new Date(baseTime + Math.random() * 7 * 24 * 60 * 60 * 1000);
      const scannerIp = randomChoice(ANOMALOUS_IPS);
      return [
        {
          timestamp: scanTime.toISOString(),
          sourceIp: scannerIp,
          username: 'anonymous',
          eventType: 'access_denied',
          statusCode: 403,
          resource: randomChoice(SENSITIVE_RESOURCES),
          userAgent: randomChoice(ANOMALOUS_USER_AGENTS),
          message: 'Automated vulnerability scan detected: probing protected paths',
          isAnomaly: true
        }
      ];
    }
  ];

  let generatedAnomalies = 0;
  while (generatedAnomalies < anomalyCount) {
    const generator = randomChoice(anomalyGenerators);
    const burst = generator();
    for (const item of burst) {
      if (generatedAnomalies < anomalyCount) {
        logs.push(item);
        generatedAnomalies++;
      }
    }
  }

  // Sort chronologically by timestamp
  logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return logs;
};

const writeCSV = (logs, filePath) => {
  const headers = [
    'timestamp',
    'sourceIp',
    'username',
    'eventType',
    'statusCode',
    'resource',
    'userAgent',
    'message',
    'isAnomaly'
  ];

  const lines = [headers.join(',')];

  logs.forEach((log) => {
    const row = [
      log.timestamp,
      log.sourceIp,
      `"${log.username.replace(/"/g, '""')}"`,
      log.eventType,
      log.statusCode,
      `"${log.resource.replace(/"/g, '""')}"`,
      `"${log.userAgent.replace(/"/g, '""')}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      log.isAnomaly
    ];
    lines.push(row.join(','));
  });

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
};

const run = async () => {
  const options = parseArgs();
  console.log(`[Sample Log Generator] Generating ${options.rows} realistic security logs (~3% anomalies)...`);

  const logs = generateLogDataset(options.rows);
  const anomaliesCount = logs.filter((l) => l.isAnomaly).length;

  writeCSV(logs, options.out);
  console.log(`[Sample Log Generator] CSV file created successfully: ${options.out}`);
  console.log(`[Sample Log Generator] Summary: ${logs.length} total rows, ${anomaliesCount} injected anomalies (${((anomaliesCount / logs.length) * 100).toFixed(2)}%).`);

  if (options.insert) {
    console.log('[Sample Log Generator] Connecting to MongoDB to insert dataset...');
    try {
      await mongoose.connect(config.mongoUri);
      console.log(`[Sample Log Generator] Connected to MongoDB: ${mongoose.connection.host}`);

      const docsToInsert = logs.map((l) => ({
        timestamp: new Date(l.timestamp),
        sourceIp: l.sourceIp,
        username: l.username,
        eventType: l.eventType,
        statusCode: l.statusCode,
        resource: l.resource,
        userAgent: l.userAgent,
        message: l.message,
        raw: JSON.stringify(l),
        anomalyScore: null,
        isAnomaly: l.isAnomaly
      }));

      const inserted = await Log.insertMany(docsToInsert, { ordered: false });
      console.log(`[Sample Log Generator] Successfully inserted ${inserted.length} log documents into MongoDB collection 'logs'.`);
    } catch (err) {
      console.error(`[Sample Log Generator Error] DB insertion failed: ${err.message}`);
    } finally {
      await mongoose.disconnect();
      console.log('[Sample Log Generator] Disconnected from MongoDB.');
    }
  }

  process.exit(0);
};

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal error running generator:', err);
    process.exit(1);
  });
}

module.exports = {
  generateLogDataset
};
