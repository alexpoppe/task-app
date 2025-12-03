// This function receives requests from your web app
// and forwards them to n8n with authentication

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get credentials from environment variables (set in Netlify dashboard)
    const username = process.env.N8N_USERNAME;
    const password = "alexanderpoppe";

    // Encode credentials for Basic Auth
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    // Parse the incoming request
    const { task_description } = JSON.parse(event.body);

    try {
        // Forward request to n8n with authentication
        const response = await fetch('https://alexanderpoppe.app.n8n.cloud/webhook/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({ task_description })
        });

        const data = await response.text();

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: response.ok,
                data: data 
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to contact n8n',
                details: error.message 
            })
        };
    }
};