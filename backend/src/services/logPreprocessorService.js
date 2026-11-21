const { VALID_EVENT_TYPES } = require('../models/Log');

/**
 * Validates IPv4 and IPv6 string formats
 */
const isValidIPv4 = (ip) => {
  if (typeof ip !== 'string') return false;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
  });
};

const isValidIPv6 = (ip) => {
  if (typeof ip !== 'string') return false;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip.trim());
};

const isValidIP = (ip) => {
  return isValidIPv4(ip) || isValidIPv6(ip);
};

/**
 * Normalizes input date/timestamp to UTC JavaScript Date
 */
const normalizeTimestamp = (input) => {
  if (!input) return null;

  // Handle epoch numbers (milliseconds or seconds)
  if (typeof input === 'number') {
    const epoch = input > 1e11 ? input : input * 1000;
    const date = new Date(epoch);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Check if numeric string
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const epoch = num > 1e11 ? num : num * 1000;
      const date = new Date(epoch);
      return isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }

  return null;
};

/**
 * Preprocesses and validates a single log entry
 */
const preprocessLogEntry = (rawItem, rowIndex = 0) => {
  if (!rawItem || typeof rawItem !== 'object') {
    return {
      isValid: false,
      reason: 'Log item must be a non-null object',
      rowIndex
    };
  }

  // 1. Timestamp validation
  const rawTimestamp = rawItem.timestamp || rawItem.time || rawItem['@timestamp'] || rawItem.datetime;
  const normalizedDate = normalizeTimestamp(rawTimestamp);
  if (!normalizedDate) {
    return {
      isValid: false,
      reason: `Invalid or missing timestamp: '${rawTimestamp}'`,
      rowIndex
    };
  }

  // 2. Source IP validation
  const rawIp = rawItem.sourceIp || rawItem.ip || rawItem.src_ip || rawItem.source_ip || rawItem.clientIp;
  if (!rawIp || typeof rawIp !== 'string' || !isValidIP(rawIp.trim())) {
    return {
      isValid: false,
      reason: `Invalid or missing IPv4/IPv6 source IP address: '${rawIp}'`,
      rowIndex
    };
  }
  const sourceIp = rawIp.trim();

  // 3. Username validation
  const rawUsername = rawItem.username || rawItem.user || rawItem.user_id || rawItem.account;
  if (!rawUsername || typeof rawUsername !== 'string' || !rawUsername.trim()) {
    return {
      isValid: false,
      reason: 'Missing or empty username',
      rowIndex
    };
  }
  const username = rawUsername.trim();

  // 4. EventType validation
  const rawEventType = rawItem.eventType || rawItem.event_type || rawItem.event || rawItem.type || rawItem.action;
  if (!rawEventType || typeof rawEventType !== 'string') {
    return {
      isValid: false,
      reason: 'Missing or empty eventType',
      rowIndex
    };
  }

  const normalizedEventType = rawEventType.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!VALID_EVENT_TYPES.includes(normalizedEventType)) {
    return {
      isValid: false,
      reason: `Unsupported eventType: '${rawEventType}'. Supported types: [${VALID_EVENT_TYPES.join(', ')}]`,
      rowIndex
    };
  }

  // 5. Status code normalization
  let statusCode = 200;
  if (rawItem.statusCode !== undefined && rawItem.statusCode !== null && rawItem.statusCode !== '') {
    const parsedCode = parseInt(rawItem.statusCode, 10);
    if (!isNaN(parsedCode)) {
      statusCode = parsedCode;
    }
  }

  // 6. Optional string fields
  const resource = typeof rawItem.resource === 'string' ? rawItem.resource.trim() : (rawItem.url || rawItem.path || '').toString().trim();
  const userAgent = typeof rawItem.userAgent === 'string' ? rawItem.userAgent.trim() : (rawItem.user_agent || '').toString().trim();
  const message = typeof rawItem.message === 'string' ? rawItem.message.trim() : (rawItem.msg || rawItem.description || '').toString().trim();
  const raw = rawItem.raw ? String(rawItem.raw) : JSON.stringify(rawItem);

  return {
    isValid: true,
    data: {
      timestamp: normalizedDate,
      sourceIp,
      username,
      eventType: normalizedEventType,
      resource,
      statusCode,
      userAgent,
      message,
      raw,
      anomalyScore: null,
      isAnomaly: false
    }
  };
};

/**
 * Parses CSV text content into structured objects
 */
const parseCSV = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return [];
  }

  // Helper to split CSV row respecting quotes
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index].replace(/^["']|["']$/g, '') : '';
    });
    rows.push(rowObj);
  }

  return rows;
};

/**
 * Parses plain-text .log content
 * Supports:
 * 1. JSON lines (NDJSON)
 * 2. Delimited lines (pipe | or tab \t)
 * 3. Key=Value formatted lines
 * 4. Standard bracket format: [timestamp] [sourceIp] [username] [eventType] [statusCode] [resource] [message]
 */
const parsePlainTextLogs = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const rows = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line) continue;

    // Check if line is JSON
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        const parsedJson = JSON.parse(line);
        parsedJson.raw = line;
        rows.push(parsedJson);
        continue;
      } catch (err) {
        // Fall back to pattern parsing if JSON parsing fails
      }
    }

    // Check bracketed format: [timestamp] [ip] [user] [eventType] [statusCode] [resource] [message]
    const bracketMatches = [...line.matchAll(/\[(.*?)\]/g)].map((m) => m[1]);
    if (bracketMatches.length >= 4) {
      rows.push({
        timestamp: bracketMatches[0],
        sourceIp: bracketMatches[1],
        username: bracketMatches[2],
        eventType: bracketMatches[3],
        statusCode: bracketMatches[4] || 200,
        resource: bracketMatches[5] || '',
        message: bracketMatches[6] || line.substring(line.lastIndexOf(']') + 1).trim(),
        raw: line
      });
      continue;
    }

    // Check pipe-delimited line: timestamp | ip | username | eventType | statusCode | resource | message
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 4) {
        rows.push({
          timestamp: parts[0],
          sourceIp: parts[1],
          username: parts[2],
          eventType: parts[3],
          statusCode: parts[4] || 200,
          resource: parts[5] || '',
          message: parts.slice(6).join(' | '),
          raw: line
        });
        continue;
      }
    }

    // Check key=value formatted lines: timestamp=... ip=... user=...
    if (line.includes('=')) {
      const kvMatches = line.match(/(\w+)=("[^"]*"|\S+)/g);
      if (kvMatches && kvMatches.length >= 3) {
        const row = { raw: line };
        kvMatches.forEach((match) => {
          const [key, ...valParts] = match.split('=');
          const val = valParts.join('=').replace(/^"|"$/g, '');
          row[key] = val;
        });
        rows.push(row);
        continue;
      }
    }

    // Fallback: Space-delimited line with at least 4 tokens
    const spaceTokens = line.split(/\s+/);
    if (spaceTokens.length >= 4) {
      rows.push({
        timestamp: spaceTokens[0],
        sourceIp: spaceTokens[1],
        username: spaceTokens[2],
        eventType: spaceTokens[3],
        statusCode: spaceTokens[4] || 200,
        resource: spaceTokens[5] || '',
        message: spaceTokens.slice(6).join(' '),
        raw: line
      });
      continue;
    }

    // If completely unparsable, still push with raw for rejection reporting
    rows.push({ raw: line, timestamp: null });
  }

  return rows;
};

/**
 * Preprocesses a collection of raw log rows, separating accepted from rejected items
 */
const preprocessBatch = (rawRows) => {
  const accepted = [];
  const rejected = [];

  rawRows.forEach((row, index) => {
    const result = preprocessLogEntry(row, index + 1);
    if (result.isValid) {
      accepted.push(result.data);
    } else {
      rejected.push({
        row: result.rowIndex,
        reason: result.reason,
        data: row
      });
    }
  });

  return {
    accepted,
    rejected,
    totalReceived: rawRows.length,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length
  };
};

module.exports = {
  isValidIPv4,
  isValidIPv6,
  isValidIP,
  normalizeTimestamp,
  preprocessLogEntry,
  parseCSV,
  parsePlainTextLogs,
  preprocessBatch
};
