import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('OPENAI_API_KEY');
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

// Fallback responses when AI is unavailable
function getFallbackResponse(intent: string, params: Record<string, any> = {}): string {
  switch(intent) {
    case 'create_event':
      return "I understand you want to create an event. Please provide details like title, date, and time.";
    case 'list_events':
      if (params.period === 'today') {
        return "You requested to see your events for today. Please check your calendar tab for a complete view.";
      } else if (params.period === 'tomorrow') {
        return "You asked about tomorrow's events. Please check your calendar tab for a complete view.";
      } else {
        return "You requested to see your upcoming events. Please check your calendar tab for a complete view.";
      }
    default:
      return "I'm here to help with your scheduling needs. You can ask me to create meetings or check your calendar.";
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
    let aiPrompt = '';
    let calendarData = null;
    
    if (intent === 'list_events') {
      // Set time range based on requested period
      let startTime, endTime;
      
      if (params.period === 'today') {
        startTime = getToday();
        endTime = new Date(startTime);
        endTime.setHours(23, 59, 59, 999);
        aiPrompt = "The user wants to know their events for today. ";
      } else if (params.period === 'tomorrow') {
        startTime = getTomorrow();
        endTime = new Date(startTime);
        endTime.setHours(23, 59, 59, 999);
        aiPrompt = "The user wants to know their events for tomorrow. ";
      } else { // default to this week
        startTime = getToday();
        endTime = getEndOfWeek();
        aiPrompt = "The user wants to know their events for this week. ";
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
        // Format meetings for the AI to describe
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
        
        aiPrompt += `Here are the meetings: ${JSON.stringify(formattedMeetings)}. Summarize these events in a friendly way. If there are no events, mention that the calendar is clear.`;
      } else {
        aiPrompt += `The user has no events scheduled ${params.period || 'this week'}. Let them know their calendar is clear.`;
        calendarData = {
          intent: 'list_events',
          meetings: [],
          period: params.period || 'this week'
        };
      }
    } else if (intent === 'create_event') {
      aiPrompt = `The user wants to create a calendar event. They mentioned: "${message}". Ask them for any missing details (title, date, time, duration) to schedule the event. If they provided enough details in their message, confirm you'll create the event with those details.`;
      calendarData = {
        intent: 'create_event',
        proposedDetails: params
      };
    } else {
      // For regular queries, just pass the message to the AI
      aiPrompt = `The user asked: "${message}". Respond as a helpful calendar and scheduling assistant.`;
    }

    // Check if OpenAI API key is available
    if (!API_KEY) {
      console.error("OpenAI API key is not available");
      return new Response(
        JSON.stringify({ 
          response: "I apologize, but my AI capabilities are currently unavailable. Please try again later or contact support.",
          calendarData: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Calling OpenAI API");
    
    // Call OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI scheduling assistant named ScheduleSidekick. Help users manage their calendar and events. Keep responses concise and friendly. If users want to schedule something, ask for all the details you need in a conversational way.'
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        // Check if this is a quota exceeded error
        const isQuotaError = errorData?.error?.code === 'insufficient_quota' || 
                             errorData?.error?.type === 'insufficient_quota' ||
                             (errorData?.error?.message && errorData.error.message.includes('quota'));
        
        if (isQuotaError) {
          throw new Error('OpenAI API quota exceeded. Please check billing details.');
        }
        
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log("AI response generated successfully");

      return new Response(
        JSON.stringify({ 
          response: aiResponse, 
          calendarData: calendarData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      
      // Provide a fallback response based on intent
      const fallbackResponse = getFallbackResponse(intent, params);
      
      // Check if this is a quota error
      const isQuotaError = error.message && error.message.includes('quota');
      const errorResponse = isQuotaError 
        ? "I apologize, but my AI service has reached its quota limit. The administrator needs to check the OpenAI account billing status. In the meantime, I can still help with basic calendar operations." 
        : fallbackResponse;
      
      return new Response(
        JSON.stringify({ 
          response: errorResponse,
          calendarData: calendarData,
          error: { type: isQuotaError ? 'quota_exceeded' : 'api_error', message: error.message }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
