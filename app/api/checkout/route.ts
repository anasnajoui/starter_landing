import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const whopApiKey = process.env.WHOP_API_KEY;
  const whopPlanId = process.env.WHOP_PLAN_ID;

  if (!whopApiKey) {
    console.error('Whop API Key is not configured.');
    return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
  }
  if (!whopPlanId) {
    console.error('Whop Plan ID is not configured.');
    return NextResponse.json({ error: 'Server configuration error: Missing Plan ID.' }, { status: 500 });
  }

  try {
    // Log incoming request details
    console.log("--- Checkout API Route Start ---"); // Added marker
    console.log("Incoming request headers:", request.headers);
    const rawBody = await request.text(); // Read body as text first
    console.log("Incoming raw request body:", rawBody);

    // Now try to parse the raw body as JSON
    let formData;
    try {
        formData = JSON.parse(rawBody);
        console.log("Parsed form data:", formData);
    } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        // Throw the error again to be caught by the outer catch block
        throw new Error('Invalid JSON format received from client.'); 
    }

    // Basic validation (can be enhanced)
    if (!formData.companyName || !formData.fullName || !formData.email || !formData.phone) {
      console.log("Validation failed: Missing required fields.") // Added log
      return NextResponse.json({ error: 'Missing required form fields.' }, { status: 400 });
    }

    console.log("Calling Whop API...");
    const whopApiUrl = 'https://api.whop.com/api/v2/checkout_sessions'; // Corrected URL

    const response = await fetch(whopApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': whopApiKey, // Already includes 'Bearer ' from env var
      },
      body: JSON.stringify({
        plan_id: whopPlanId,
        metadata: {
          companyName: formData.companyName,
          fullName: formData.fullName,
          email: formData.email,
          phone: `+39${formData.phone}`, // Combine country code and number
          // Add new fields to metadata
          sector: formData.sector, 
          socialLink: formData.socialLink,
        },
        // redirect_url: 'YOUR_SUCCESS_URL' // Optional: Add if you want Whop to redirect after success
      }),
    });
    
    console.log("Whop API response status:", response.status);

    if (!response.ok) {
        const whopErrorText = await response.text(); // Change let to const
        console.error(`Whop API Error (${response.status}):`, whopErrorText);
        // Use Whop's error text if available, otherwise create a generic one
        const errorMessage = whopErrorText || `Failed to create checkout session. Status: ${response.status}`;
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const responseData = await response.json();
    console.log("Whop API response data:", responseData);

    if (!responseData.purchase_url) {
        console.error('Whop API response missing purchase_url:', responseData);
        return NextResponse.json({ error: 'Failed to retrieve purchase URL from Whop.' }, { status: 500 });
    }

    console.log("Successfully created checkout session. Purchase URL:", responseData.purchase_url);
    console.log("--- Checkout API Route End ---");
    return NextResponse.json({ purchase_url: responseData.purchase_url });

  } catch (error) {
    console.error('Error creating checkout session (outer catch):', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = String(error);
    }
    console.log("--- Checkout API Route Error End ---");
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 