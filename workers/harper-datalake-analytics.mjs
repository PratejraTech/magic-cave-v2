/**
 * Harper Data Lake Analytics Worker
 * 
 * Merges data from KV (unique-harper-sessions) and D1 (session_events)
 * Enriches with metadata and stores in R2 Data Lake
 * Runs every 6 hours via cron trigger
 */

/**
 * Get all session keys from KV namespace
 * Note: KV doesn't support listing all keys directly, so we'll need to track sessions
 * For now, we'll query D1 for all unique session_ids and fetch those from KV
 */
async function getAllSessionsFromKV(kv) {
  if (!kv) return [];
  
  const sessions = [];
  // Since KV doesn't support list operations easily, we'll rely on D1 session_ids
  // and fetch sessions as needed
  return sessions;
}

/**
 * Get all session events from D1 grouped by session
 */
async function getAllSessionEventsFromD1(db) {
  if (!db) return [];
  
  try {
    // Get all unique session IDs with their event counts
    const sessionsQuery = await db.prepare(`
      SELECT 
        session_id,
        COUNT(*) as event_count,
        MIN(timestamp) as first_event,
        MAX(timestamp) as last_event,
        GROUP_CONCAT(DISTINCT event_type) as event_types
      FROM session_events
      GROUP BY session_id
      ORDER BY last_event DESC
    `).all();
    
    if (!sessionsQuery.results) return [];
    
    // For each session, get detailed events
    const enrichedSessions = [];
    for (const session of sessionsQuery.results) {
      const eventsQuery = await db.prepare(`
        SELECT * FROM session_events
        WHERE session_id = ?
        ORDER BY timestamp ASC
      `).bind(session.session_id).all();
      
      enrichedSessions.push({
        sessionId: session.session_id,
        eventCount: session.event_count,
        firstEvent: session.first_event,
        lastEvent: session.last_event,
        eventTypes: session.event_types ? session.event_types.split(',') : [],
        events: eventsQuery.results || [],
      });
    }
    
    return enrichedSessions;
  } catch (error) {
    console.error('Error fetching session events from D1:', error);
    return [];
  }
}

/**
 * Enrich session data by merging KV session info with D1 events
 */
async function enrichSessionData(kv, sessionId, d1SessionData) {
  if (!kv) return d1SessionData;
  
  try {
    // Fetch session metadata from KV
    const sessionKey = `session:${sessionId}`;
    const sessionData = await kv.get(sessionKey, 'json');
    
    if (!sessionData) {
      return {
        ...d1SessionData,
        metadata: {
          source: 'd1_only',
          hasKvData: false,
        },
      };
    }
    
    // Merge and enrich
    return {
      ...d1SessionData,
      sessionMetadata: {
        userId: sessionData.userId,
        userType: sessionData.userType,
        isHarper: sessionData.isHarper || false,
        isGuest: sessionData.isGuest || false,
        ip: sessionData.ip,
        createdAt: sessionData.createdAt,
        lastActive: sessionData.lastActive,
        sessionToken: sessionData.sessionToken ? '***REDACTED***' : null, // Security: don't store tokens
      },
      metadata: {
        source: 'kv_and_d1',
        hasKvData: true,
        enrichmentTimestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`Error enriching session ${sessionId}:`, error);
    return {
      ...d1SessionData,
      metadata: {
        source: 'd1_only',
        hasKvData: false,
        error: error.message,
      },
    };
  }
}

/**
 * Generate analytics summary
 */
function generateAnalyticsSummary(enrichedSessions) {
  const summary = {
    totalSessions: enrichedSessions.length,
    harperSessions: 0,
    guestSessions: 0,
    normalSessions: 0,
    totalEvents: 0,
    eventTypeBreakdown: {},
    ipAddresses: new Set(),
    dateRange: {
      earliest: null,
      latest: null,
    },
    sessionsByType: {
      harper: [],
      guest: [],
      normal: [],
    },
  };
  
  for (const session of enrichedSessions) {
    // Count by type
    if (session.sessionMetadata?.isHarper) {
      summary.harperSessions++;
      summary.sessionsByType.harper.push(session.sessionId);
    } else if (session.sessionMetadata?.isGuest) {
      summary.guestSessions++;
      summary.sessionsByType.guest.push(session.sessionId);
    } else {
      summary.normalSessions++;
      summary.sessionsByType.normal.push(session.sessionId);
    }
    
    // Count events
    summary.totalEvents += session.eventCount;
    
    // Track IP addresses
    if (session.sessionMetadata?.ip) {
      summary.ipAddresses.add(session.sessionMetadata.ip);
    }
    
    // Event type breakdown
    for (const eventType of session.eventTypes) {
      summary.eventTypeBreakdown[eventType] = (summary.eventTypeBreakdown[eventType] || 0) + 1;
    }
    
    // Date range
    if (session.firstEvent) {
      const firstDate = new Date(session.firstEvent);
      if (!summary.dateRange.earliest || firstDate < new Date(summary.dateRange.earliest)) {
        summary.dateRange.earliest = session.firstEvent;
      }
    }
    if (session.lastEvent) {
      const lastDate = new Date(session.lastEvent);
      if (!summary.dateRange.latest || lastDate > new Date(summary.dateRange.latest)) {
        summary.dateRange.latest = session.lastEvent;
      }
    }
  }
  
  // Convert Set to Array for JSON serialization
  summary.uniqueIpAddresses = Array.from(summary.ipAddresses);
  summary.ipAddresses = undefined; // Remove Set
  
  return summary;
}

/**
 * Store enriched data in R2 Data Lake
 */
async function storeInDataLake(r2, enrichedData, summary, timestamp) {
  if (!r2) {
    console.warn('R2 bucket not configured, skipping data lake storage');
    return;
  }
  
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    
    // Store full enriched data
    const enrichedKey = `enriched/${year}/${month}/${day}/enriched-${timestamp}.json`;
    await r2.put(enrichedKey, JSON.stringify(enrichedData, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        timestamp: timestamp,
        recordCount: String(enrichedData.length),
        dataType: 'enriched_sessions',
      },
    });
    
    // Store analytics summary
    const summaryKey = `analytics/${year}/${month}/${day}/summary-${timestamp}.json`;
    await r2.put(summaryKey, JSON.stringify(summary, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        timestamp: timestamp,
        dataType: 'analytics_summary',
      },
    });
    
    // Store latest snapshot (overwrites previous)
    await r2.put('latest/enriched-sessions.json', JSON.stringify(enrichedData, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        timestamp: timestamp,
        recordCount: String(enrichedData.length),
        dataType: 'latest_snapshot',
      },
    });
    
    await r2.put('latest/analytics-summary.json', JSON.stringify(summary, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        timestamp: timestamp,
        dataType: 'latest_summary',
      },
    });
    
    console.log(`✅ Stored data lake files:
      - ${enrichedKey}
      - ${summaryKey}
      - latest/enriched-sessions.json
      - latest/analytics-summary.json`);
    
    return {
      enrichedKey,
      summaryKey,
      recordCount: enrichedData.length,
    };
  } catch (error) {
    console.error('Error storing in data lake:', error);
    throw error;
  }
}

/**
 * Main worker handler
 */
export default {
  async scheduled(event, env, ctx) {
    const timestamp = new Date().toISOString();
    console.log(`🚀 Starting Harper Data Lake analytics run at ${timestamp}`);
    
    try {
      // Step 1: Get all session events from D1
      console.log('📊 Fetching session events from D1...');
      const d1Sessions = await getAllSessionEventsFromD1(env.DB);
      console.log(`   Found ${d1Sessions.length} sessions in D1`);
      
      // Step 2: Enrich each session with KV metadata
      console.log('🔍 Enriching sessions with KV metadata...');
      const enrichedSessions = [];
      for (const d1Session of d1Sessions) {
        const enriched = await enrichSessionData(
          env.UNIQUE_HARPER_SESSIONS,
          d1Session.sessionId,
          d1Session
        );
        enrichedSessions.push(enriched);
      }
      console.log(`   Enriched ${enrichedSessions.length} sessions`);
      
      // Step 3: Generate analytics summary
      console.log('📈 Generating analytics summary...');
      const summary = generateAnalyticsSummary(enrichedSessions);
      summary.generatedAt = timestamp;
      summary.dataSource = {
        kvNamespace: 'unique-harper-sessions',
        d1Database: 'harper-advent-sessions',
        r2Bucket: 'harper-datalake',
      };
      console.log(`   Summary: ${summary.totalSessions} sessions, ${summary.totalEvents} events`);
      
      // Step 4: Store in R2 Data Lake
      console.log('💾 Storing in R2 Data Lake...');
      const storageResult = await storeInDataLake(
        env.HARPER_DATALAKE,
        enrichedSessions,
        summary,
        timestamp
      );
      
      console.log(`✅ Data Lake analytics complete!`);
      console.log(`   Stored ${storageResult.recordCount} enriched sessions`);
      console.log(`   Files: ${storageResult.enrichedKey}, ${storageResult.summaryKey}`);
      
      return new Response(JSON.stringify({
        success: true,
        timestamp,
        summary: {
          totalSessions: summary.totalSessions,
          totalEvents: summary.totalEvents,
          harperSessions: summary.harperSessions,
          guestSessions: summary.guestSessions,
        },
        storage: storageResult,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('❌ Data Lake analytics failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

