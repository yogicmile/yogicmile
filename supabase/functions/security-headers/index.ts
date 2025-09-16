import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security headers configuration
    const securityHeaders = {
      // Content Security Policy - restrict resource loading
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      
      // Prevent XSS attacks
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      
      // Strict Transport Security for HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=()',
        'usb=()',
        'magnetometer=()'
      ].join(', '),
      
      // Additional security headers
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };

    // Log security headers request
    console.log(`Security headers requested at ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        headers: securityHeaders,
        message: 'Security headers configuration retrieved successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...securityHeaders
        },
      }
    );

  } catch (error) {
    console.error('Security headers error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to configure security headers'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});