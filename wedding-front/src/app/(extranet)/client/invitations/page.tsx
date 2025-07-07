'use client';

import { useInvitations } from '@/hooks/useInvitations';

export default function InvitationsPage() {
  const { invitations, loading, error } = useInvitations();

  if (loading) {
    return <div className="p-8">Chargement des invitations...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Mes Invitations</h1>
      
      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore d'invitations.</p>
          <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
            Créer une invitation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{invitation.title}</h3>
              <p className="text-gray-600 mb-4">{invitation.description}</p>
              
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> {new Date(invitation.weddingDate).toLocaleDateString()}</p>
                <p><strong>Lieu:</strong> {invitation.venueName}</p>
                <p><strong>Adresse:</strong> {invitation.venueAddress}</p>
                <p><strong>Statut:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    invitation.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invitation.status}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark text-sm">
                  Modifier
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-sm">
                  Voir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 