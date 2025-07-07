import React from 'react';
import { Card } from '@/components/Card/Card';
import { rsvpApi } from '@/lib/api/rsvp';

async function getStatus(token: string) {
  try {
    return await rsvpApi.getStatus(token);
  } catch (error) {
    console.error('Error fetching RSVP status:', error);
    return null;
  }
}

export default async function RSVPThankYouPage({ params }: { params: { token: string } }) {
  const status = await getStatus(params.token);

  if (!status) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <div className="text-center p-8">
            <h1 className="text-3xl font-serif mb-6">
              Une erreur est survenue
            </h1>
            <p>
              Nous n'avons pas pu récupérer votre réponse. Veuillez réessayer plus tard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <div className="text-center p-8">
          <h1 className="text-3xl font-serif mb-6">
            Merci pour votre réponse !
          </h1>

          {status.status === 'CONFIRMED' ? (
            <div className="space-y-4">
              <p className="text-xl text-green-600">
                Nous sommes ravis de vous compter parmi nous !
              </p>
              <p>
                Vous avez confirmé votre présence pour {status.numberOfGuests} personne{status.numberOfGuests > 1 ? 's' : ''}.
              </p>
              {status.attendingCeremony && (
                <p>Vous serez présent(e) à la cérémonie.</p>
              )}
              {status.attendingReception && (
                <p>Vous serez présent(e) à la réception.</p>
              )}
              {status.message && (
                <div className="mt-8">
                  <h2 className="text-xl mb-2">Votre message :</h2>
                  <p className="italic">{status.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl">
                Nous sommes désolés que vous ne puissiez pas être présent(e).
              </p>
              {status.message && (
                <div className="mt-8">
                  <h2 className="text-xl mb-2">Votre message :</h2>
                  <p className="italic">{status.message}</p>
                </div>
              )}
            </div>
          )}

          <p className="mt-8">
            Vous pouvez toujours modifier votre réponse en revenant sur{' '}
            <a
              href={`/rsvp/${params.token}`}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              la page précédente
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
} 