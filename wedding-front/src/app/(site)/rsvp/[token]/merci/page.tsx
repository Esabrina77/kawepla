'use client';

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
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
        <Card className="max-w-2xl mx-auto shadow-lg">
          <div className="text-center p-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <h1 className="text-3xl font-serif mb-6 text-gray-800">
              Une erreur est survenue
            </h1>
            <p className="text-gray-600 text-lg">
              Nous n'avons pas pu récupérer votre réponse. Veuillez réessayer plus tard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
      <style jsx>{`
        .thank-you-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid #e9ecef;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: fadeInUp 0.6s ease-out;
        }
        
        .success-icon {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          animation: pulse 2s infinite;
        }
        
        .decline-icon {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        }
        
        .message-box {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-left: 4px solid #C5A880;
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-top: 2rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #C5A880 0%, #B39670 100%);
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .back-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(197, 168, 128, 0.3);
          color: white;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(197, 168, 128, 0.1);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .detail-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #C5A880;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
        }
      `}</style>
      
      <Card className="max-w-3xl mx-auto thank-you-card">
        <div className="text-center p-12">
          <div className="mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              status.status === 'CONFIRMED' ? 'success-icon' : 'decline-icon'
            }`}>
              <span className="text-4xl">
                {status.status === 'CONFIRMED' ? '🎉' : '😔'}
              </span>
            </div>
          </div>
          
          <h1 className="text-4xl font-serif mb-8 text-gray-800">
            Merci pour votre réponse !
          </h1>

          {status.status === 'CONFIRMED' ? (
            <div className="space-y-6">
              <p className="text-2xl text-green-600 font-medium">
                Nous sommes ravis de vous compter parmi nous ! ✨
              </p>
              
              <div className="max-w-md mx-auto space-y-3">
                <div className="detail-item">
                  <div className="detail-icon">👥</div>
                  <span className="text-lg">
                    {status.numberOfGuests} personne{status.numberOfGuests > 1 ? 's' : ''}
                  </span>
                </div>
                
                {status.attendingCeremony && (
                  <div className="detail-item">
                    <div className="detail-icon">💒</div>
                    <span>Présent(e) à la cérémonie</span>
                  </div>
                )}
                
                {status.attendingReception && (
                  <div className="detail-item">
                    <div className="detail-icon">🥂</div>
                    <span>Présent(e) à la réception</span>
                  </div>
                )}
              </div>
              
              {status.message && (
                <div className="message-box">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    💌 Votre message pour les mariés
                  </h3>
                  <p className="italic text-gray-700 text-left leading-relaxed">
                    "{status.message}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xl text-gray-600">
                Nous sommes désolés que vous ne puissiez pas être présent(e).
              </p>
              <p className="text-lg text-gray-500">
                Nous espérons vous voir lors d'une prochaine occasion ! 💕
              </p>
              
              {status.message && (
                <div className="message-box">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    💌 Votre message pour les mariés
                  </h3>
                  <p className="italic text-gray-700 text-left leading-relaxed">
                    "{status.message}"
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-6">
              Vous pouvez toujours modifier votre réponse si nécessaire
            </p>
            <a
              href={`/rsvp/${params.token}`}
              className="back-link"
            >
              <span>🔄</span>
              Modifier ma réponse
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
} 