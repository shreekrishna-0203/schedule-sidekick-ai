
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Intent detection for calendar operations
function detectIntent(text: string): { 
  intent: 'create_event' | 'list_events' | 'query' | 'unknown',
  params: Record<string, any>
} {
  const lowerText = text.toLowerCase();
  
  // Detect create event intent
  if (
    lowerText.includes('schedule') || 
    lowerText.includes('create meeting') || 
    lowerText.includes('add event') ||
    (lowerText.includes('set up') && (lowerText.includes('meeting') || lowerText.includes('call')))
  ) {
    // Extract potential parameters
    const params: Record<string, any> = {};
    
    // Try to extract date
    const dateMatch = text.match(/(?:on|for)\s+(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{1,2})(?:st|nd|rd|th)?)?/i);
    if (dateMatch) {
      params.dateHint = dateMatch[0];
    }
    
    // Try to extract time
    const timeMatch = text.match(/(?:at|from)\s+(\d{1,2}(?::\d{2})?)\s*(?:am|pm)?/i);
    if (timeMatch) {
      params.timeHint = timeMatch[0];
    }
    
    // Try to extract title
    if (lowerText.includes('about')) {
      const aboutMatch = text.match(/about\s+([^,\.]+)/i);
      if (aboutMatch) {
        params.title = aboutMatch[1].trim();
      }
    }
    
    return { intent: 'create_event', params };
  }
  
  // Detect list events intent
  if (
    (lowerText.includes('show') && lowerText.includes('calendar')) ||
    (lowerText.includes('list') && lowerText.includes('events')) ||
    (lowerText.includes('what') && (lowerText.includes('schedule') || lowerText.includes('meetings'))) ||
    (lowerText.includes('events') && (lowerText.includes('today') || lowerText.includes('tomorrow') || lowerText.includes('this week')))
  ) {
    const params: Record<string, any> = {};
    
    // Check for time filters
    if (lowerText.includes('today')) {
      params.period = 'today';
    } else if (lowerText.includes('tomorrow')) {
      params.period = 'tomorrow';
    } else if (lowerText.includes('this week')) {
      params.period = 'week';
    }
    
    return { intent: 'list_events', params };
  }
  
  // Default to general query
  return { intent: 'query', params: {} };
}

// Helper to get today's date with time set to 00:00:00
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Helper to get tomorrow's date with time set to 00:00:00
function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

// Helper to get the end of the week (Sunday)
function getEndOfWeek() {
  const endOfWeek = new Date();
  const day = endOfWeek.getDay();
  const diff = day === 0 ? 0 : 7 - day; // If today is Sunday, end of week is today
  endOfWeek.setDate(endOfWeek.getDate() + diff);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

// Format meeting time for display
function formatMeetingTime(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
}

// Custom AI implementation
function generateAIResponse(intent: string, params: Record<string, any> = {}, meetings: any[] = []): string {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  switch(intent) {
    case 'create_event':
      const dateHint = params.dateHint || 'tomorrow';
      const timeHint = params.timeHint || 'in the morning';
      const title = params.title || 'your event';
      
      return `I'd be happy to help you schedule ${title}. I see you want it ${dateHint} ${timeHint}. Let me set that up for you. Can you confirm this works for you, or would you like to adjust any details?`;
    
    case 'list_events':
      if (meetings.length === 0) {
        const periodText = params.period === 'today' 
          ? 'today' 
          : params.period === 'tomorrow' 
            ? 'tomorrow' 
            : 'this week';
        return `Looking at your calendar, you don't have any events scheduled for ${periodText}. Your schedule is clear!`;
      } else {
        const periodText = params.period === 'today' 
          ? 'today' 
          : params.period === 'tomorrow' 
            ? 'tomorrow' 
            : 'this week';
        let response = `Here's what you have scheduled for ${periodText}:\n\n`;
        
        meetings.forEach((meeting: any, index: number) => {
          response += `${index + 1}. "${meeting.title}" at ${meeting.time} on ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\n`;
        });
        
        return response;
      }
    
    default:
      // Handle general queries with contextual responses
      const query = params.query?.toLowerCase() || '';
      
      if (query.includes('hello') || query.includes('hi')) {
        return `Hello! I'm your scheduling assistant. Today is ${dateString} and the current time is ${timeString}. How can I help you with your calendar today?`;
      } else if (query.includes('time')) {
        return `The current time is ${timeString} on ${dateString}.`;
      } else if (query.includes('weather')) {
        return `I'm a scheduling assistant and don't have access to current weather data. I can help you manage your calendar though!`;
      } else if (query.includes('help')) {
        return `I can help you manage your schedule! You can ask me to:
- Schedule meetings or events
- Show your calendar for today, tomorrow, or this week
- Check specific time slots
- Manage your appointments

Just let me know what you need!`;
      } else {
        return `I'm your scheduling assistant, ready to help with your calendar! You can ask me to schedule meetings, check your agenda, or manage your events. What would you like to do today?`;
      }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function received request");
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { message, userId } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message from user ${userId}: "${message}"`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Detect the user's intent
    const { intent, params } = detectIntent(message);
    console.log(`Detected intent: ${intent}`, params);
    
    // Process based on intent
    let aiResponse = '';
    let calendarData = null;
    
    if (intent === 'list_events') {
      // Set time range based on requested period
      let startTime, endTime;
      
      if (params.period === 'today') {
        startTime = getToday();
        endTime = new Date(startTime);
        endTime.setHours(23, 59, 59, 999);
      } else if (params.period === 'tomorrow') {
        startTime = getTomorrow();
        endTime = new Date(startTime);
        endTime.setHours(23, 59, 59, 999);
      } else { // default to this week
        startTime = getToday();
        endTime = getEndOfWeek();
      }
      
      // Query user's meetings within the time range
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startTime.toISOString())
        .lte('end_time', endTime.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch calendar data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (meetings && meetings.length > 0) {
        // Format meetings for response
        const formattedMeetings = meetings.map(m => ({
          title: m.title,
          time: formatMeetingTime(m.start_time, m.end_time),
          date: new Date(m.start_time).toLocaleDateString(),
          isVirtual: m.is_virtual
        }));
        
        calendarData = {
          intent: 'list_events',
          meetings: formattedMeetings,
          period: params.period || 'this week'
        };
        
        aiResponse = generateAIResponse(intent, params, formattedMeetings);
      } else {
        aiResponse = generateAIResponse(intent, params, []);
        calendarData = {
          intent: 'list_events',
          meetings: [],
          period: params.period || 'this week'
        };
      }
    } else if (intent === 'create_event') {
      aiResponse = generateAIResponse(intent, params);
      calendarData = {
        intent: 'create_event',
        proposedDetails: params
      };
    } else {
      // For regular queries, generate a response based on the message
      params.query = message;
      aiResponse = generateAIResponse('query', params);
    }

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        calendarData: calendarData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred',
        response: "I'm sorry, but something went wrong. Please try again later."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
