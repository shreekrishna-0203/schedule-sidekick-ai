
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

// Enhanced AI response generator with more conversational and contextual awareness
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

  // Advanced conversational patterns for more natural responses
  const greetings = [
    "Hello there! ",
    "Hi! ",
    "Greetings! ",
    "Hey! "
  ];
  
  const confirmations = [
    "I'd be happy to help with that. ",
    "I can definitely assist you with this. ",
    "Let me take care of that for you. ",
    "Sure thing! "
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const randomConfirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
  
  // Process different intent types with more natural language
  switch(intent) {
    case 'create_event':
      const dateHint = params.dateHint || 'tomorrow';
      const timeHint = params.timeHint || 'in the morning';
      const title = params.title || 'your event';
      
      const eventResponses = [
        `${randomConfirmation}I'll set up ${title} for ${dateHint} ${timeHint}. Would you like to add any specific details to this event?`,
        `I'll schedule "${title}" ${dateHint} ${timeHint} for you. Is there anything else you'd like to add to this event?`,
        `I'm creating an event called "${title}" for ${dateHint} ${timeHint}. Would you like to add any attendees or other details?`
      ];
      
      return eventResponses[Math.floor(Math.random() * eventResponses.length)];
    
    case 'list_events':
      if (meetings.length === 0) {
        const periodText = params.period === 'today' 
          ? 'today' 
          : params.period === 'tomorrow' 
            ? 'tomorrow' 
            : 'this week';
            
        const emptyCalendarResponses = [
          `I've checked your calendar, and you have no events scheduled for ${periodText}. Your schedule is clear!`,
          `Good news! Your calendar is completely free ${periodText}.`,
          `Looking at your calendar, I don't see any events scheduled for ${periodText}.`
        ];
        
        return emptyCalendarResponses[Math.floor(Math.random() * emptyCalendarResponses.length)];
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
        
        const busyDayResponses = [
          `\nLooks like you've got ${meetings.length > 1 ? 'some events' : 'an event'} coming up. Anything else you'd like to know about your schedule?`,
          `\nThat's your agenda for ${periodText}. Would you like me to add another event or check a different day?`,
          `\nIs there anything specific about these events you'd like to know more about?`
        ];
        
        return response + busyDayResponses[Math.floor(Math.random() * busyDayResponses.length)];
      }
    
    default:
      // Handle general queries with contextual responses
      const query = params.query?.toLowerCase() || '';
      
      if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        const timeBasedGreetings = [
          `${randomGreeting}I'm your scheduling assistant. Today is ${dateString} and the current time is ${timeString}. How can I help you with your schedule today?`,
          `${randomGreeting}It's ${timeString} on ${dateString}. How can I assist with your calendar today?`,
          `${randomGreeting}Nice to chat with you! It's currently ${timeString}. What can I help you with regarding your schedule?`
        ];
        
        return timeBasedGreetings[Math.floor(Math.random() * timeBasedGreetings.length)];
      } else if (query.includes('time')) {
        return `The current time is ${timeString} on ${dateString}. Is there something specific you'd like to schedule at this time?`;
      } else if (query.includes('weather')) {
        return `I'm your scheduling assistant and don't have access to real-time weather data. But I can help you manage your calendar! Would you like to check your schedule or create a new event?`;
      } else if (query.includes('help')) {
        return `I'd be happy to help! I can:
- Schedule meetings or events
- Show your calendar for today, tomorrow, or this week
- Check specific time slots
- Help manage your appointments

Just let me know what you need, and I'll assist you right away!`;
      } else if (query.includes('thank')) {
        const thankResponses = [
          "You're welcome! Is there anything else I can help you with regarding your schedule?",
          "Happy to help! Let me know if you need any other assistance with your calendar.",
          "Anytime! I'm here whenever you need help managing your schedule."
        ];
        
        return thankResponses[Math.floor(Math.random() * thankResponses.length)];
      } else if (query.includes('who are you') || query.includes('what can you do')) {
        return `I'm your scheduling assistant, designed to help manage your calendar efficiently. I can create events, check your schedule, and help you stay organized. What would you like help with today?`;
      } else {
        // General fallback responses with conversation starters
        const fallbackResponses = [
          `I'm your scheduling assistant, ready to help! You can ask me to schedule meetings, check your calendar, or manage your events. What would you like to do today?`,
          `Hi there! I can help you manage your schedule. Would you like to create a new event, check your existing schedule, or do something else with your calendar?`,
          `I'm here to assist with your scheduling needs. You can ask me to set up meetings, view your calendar, or help organize your day. How can I help you today?`
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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
