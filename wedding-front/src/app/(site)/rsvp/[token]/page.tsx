import React from 'react';
import { notFound } from 'next/navigation';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { rsvpApi } from '@/lib/api/rsvp';

async function getInvitation(token: string) {
  try {
    const invitation = await rsvpApi.getInvitation(token);
    const status = await rsvpApi.getStatus(token);
    return { invitation, status };
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
}

export default async function RSVPPage({ params }: { params: { token: string } }) {
  const data = await getInvitation(params.token);

  if (!data) {
    notFound();
  }

  const { invitation, status } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <div className="text-center p-8">
          <h1 className="text-3xl font-serif mb-6">
            {invitation.title}
          </h1>
          
          <div className="my-8">
            <p className="text-2xl mb-2">
              {new Date(invitation.weddingDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {invitation.ceremonyTime && (
              <p className="text-xl mb-2">
                Cérémonie à {invitation.ceremonyTime}
              </p>
            )}
            {invitation.receptionTime && (
              <p className="text-xl mb-2">
                Réception à {invitation.receptionTime}
              </p>
            )}
            <p className="text-xl">
              à {invitation.venueName}
              <br />
              {invitation.venueAddress}
            </p>
          </div>

          <form action={`/api/rsvp/${params.token}/respond`} method="POST" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse
              </label>
              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  name="status"
                  value="CONFIRMED"
                  className={`px-4 py-2 rounded-md ${
                    status.status === 'CONFIRMED'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Je serai présent(e)
                </button>
                <button
                  type="submit"
                  name="status"
                  value="DECLINED"
                  className={`px-4 py-2 rounded-md ${
                    status.status === 'DECLINED'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Je ne pourrai pas venir
                </button>
              </div>
            </div>

            {status.status === 'CONFIRMED' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de personnes
                  </label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    min="1"
                    defaultValue={status.numberOfGuests || 1}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="attendingCeremony"
                        defaultChecked={status.attendingCeremony !== false}
                        className="rounded border-gray-300 text-primary-600"
                      />
                      <span className="ml-2">Je serai présent(e) à la cérémonie</span>
                    </label>
                  </div>
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="attendingReception"
                        defaultChecked={status.attendingReception !== false}
                        className="rounded border-gray-300 text-primary-600"
                      />
                      <span className="ml-2">Je serai présent(e) à la réception</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrictions alimentaires
                  </label>
                  <textarea
                    name="dietaryRestrictions"
                    rows={3}
                    defaultValue={status.dietaryRestrictions}
                    className="block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Végétarien, allergies, etc."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message pour les mariés
              </label>
              <textarea
                name="message"
                rows={4}
                defaultValue={status.message}
                className="block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Votre message..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Envoyer ma réponse
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
} 