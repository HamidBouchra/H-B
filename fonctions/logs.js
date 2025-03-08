const faunadb = require('faunadb');
const q = faunadb.query;

// Configuration FaunaDB (remplacez par votre clé secrète)
const client = new faunadb.Client({ secret: '424853576026685643' });

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            const response = await client.query(
                q.Map(
                    q.Paginate(q.Documents(q.Collection('logs'))),
                    q.Lambda('X', q.Get(q.Var('X')))
                )
            );
            return {
                statusCode: 200,
                body: JSON.stringify(response.data.map(doc => doc.data))
            };
        } else if (event.httpMethod === 'POST') {
            const newLog = JSON.parse(event.body);
            await client.query(
                q.Create(q.Collection('logs'), { data: newLog })
            );
            return {
                statusCode: 201,
                body: JSON.stringify({ success: true })
            };
        } else if (event.httpMethod === 'DELETE') {
            await client.query(
                q.Map(
                    q.Paginate(q.Documents(q.Collection('logs'))),
                    q.Lambda('X', q.Delete(q.Var('X')))
                )
            );
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        }
        return { statusCode: 405, body: 'Méthode non autorisée' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Erreur serveur' }) };
    }
};
