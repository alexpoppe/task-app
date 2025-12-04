exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const username = process.env.N8N_USERNAME;
    const password = process.env.N8N_PASSWORD;
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    try {
        const response = await fetch('https://alexanderpoppe.app.n8n.cloud/webhook/sync-calendar', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: response.ok })
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