const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({ secret: 'VOTRE_CLE_FAUNADB' });

exports.handler = async (event) => {
    try {
        const systemRef = q.Ref(q.Collection('system'), '1'); // ID fixe pour simplifier
        if (event.httpMethod === 'GET') {
            let system;
            try {
                system = await client.query(q.Get(systemRef));
            } catch {
                // Si le document n'existe pas, le créer avec "active: true"
                system = await client.query(
                    q.Create(systemRef, { data: { active: true } })
                );
            }
            return {
                statusCode: 200,
                body: JSON.stringify(system.data)
            };
        } else if (event.httpMethod === 'POST') {
            const { active } = JSON.parse(event.body);
            await client.query(
                q.Update(systemRef, { data: { active } })
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