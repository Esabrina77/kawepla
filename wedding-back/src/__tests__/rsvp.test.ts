import request from 'supertest';
import app from '@/app';
import { InvitationStatus, RSVPStatus, Guest, RSVP, Invitation } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prismaMock } from './mocks/prisma.mock';

describe('RSVP Routes', () => {
  let authToken: string;
  let userId: string;
  let invitationId: string;
  let guestId: string;
  let inviteToken: string;

  beforeEach(() => {
    // Réinitialiser les données de test
    userId = 'test-user-id';
    invitationId = 'test-invitation-id';
    guestId = 'test-guest-id';
    inviteToken = 'test-invite-token';
    authToken = jwt.sign({ id: userId }, process.env['JWT_SECRET'] || 'test-secret');
  });

  describe('POST /api/rsvp/respond', () => {
    it('should create a new RSVP response', async () => {
      // Mock des données
      const mockGuest: Guest = {
        id: guestId,
        firstName: 'Test',
        lastName: 'Guest',
        email: 'test.guest@example.com',
        phone: null,
        isVIP: false,
        dietaryRestrictions: null,
        plusOne: true,
        plusOneName: null,
        inviteToken,
        usedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        invitationId
      };

      const mockInvitation: Invitation = {
        id: invitationId,
        title: 'Test Wedding',
        description: null,
        weddingDate: new Date(),
        ceremonyTime: null,
        receptionTime: null,
        venueName: 'Test Venue',
        venueAddress: 'Test Address',
        venueCoordinates: null,
        customDomain: null,
        status: InvitationStatus.PUBLISHED,
        theme: {},
        photos: [],
        program: null,
        restrictions: null,
        languages: ['fr'],
        maxGuests: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        designId: 'test-design-id'
      };

      const mockRSVP: RSVP = {
        id: 'test-rsvp-id',
        status: RSVPStatus.CONFIRMED,
        message: 'Looking forward to it!',
        attendingCeremony: true,
        attendingReception: true,
        numberOfGuests: 2,
        respondedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        invitationId,
        guestId
      };

      // Configuration des mocks
      prismaMock.guest.findUnique.mockResolvedValue({
        ...mockGuest,
        invitation: mockInvitation
      } as any);

      prismaMock.rSVP.create.mockResolvedValue(mockRSVP);
      prismaMock.guest.update.mockResolvedValue({ ...mockGuest, usedAt: new Date() });

      const response = await request(app)
        .post('/api/rsvp/respond')
        .send({
          inviteToken,
          status: RSVPStatus.CONFIRMED,
          message: 'Looking forward to it!',
          attendingCeremony: true,
          attendingReception: true,
          numberOfGuests: 2
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(RSVPStatus.CONFIRMED);
      expect(response.body.numberOfGuests).toBe(2);
    });

    it('should fail for unpublished invitation', async () => {
      // Mock d'une invitation non publiée
      prismaMock.guest.findUnique.mockResolvedValue({
        id: guestId,
        invitation: {
          status: InvitationStatus.DRAFT
        }
      } as any);

      const response = await request(app)
        .post('/api/rsvp/respond')
        .send({
          inviteToken: 'unpublished-token',
          status: RSVPStatus.CONFIRMED,
          numberOfGuests: 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cette invitation n\'est pas encore publiée');
    });

    it('should fail for already used invite token', async () => {
      // Mock d'un invité avec token déjà utilisé
      prismaMock.guest.findUnique.mockResolvedValue({
        id: guestId,
        usedAt: new Date(),
        invitation: {
          status: InvitationStatus.PUBLISHED
        }
      } as any);

      const response = await request(app)
        .post('/api/rsvp/respond')
        .send({
          inviteToken: 'used-token',
          status: RSVPStatus.CONFIRMED,
          numberOfGuests: 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Ce lien d\'invitation a déjà été utilisé');
    });

    it('should fail with invalid number of guests', async () => {
      // Mock d'un invité sans plus-one
      prismaMock.guest.findUnique.mockResolvedValue({
        id: guestId,
        plusOne: false,
        invitation: {
          status: InvitationStatus.PUBLISHED
        }
      } as any);

      const response = await request(app)
        .post('/api/rsvp/respond')
        .send({
          inviteToken,
          status: RSVPStatus.CONFIRMED,
          numberOfGuests: 2
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Nombre d\'invités non autorisé');
    });
  });

  describe('GET /api/rsvp/:inviteToken', () => {
    it('should get RSVP status by invite token', async () => {
      const mockRSVP: RSVP = {
        id: 'test-rsvp-id',
        status: RSVPStatus.PENDING,
        message: null,
        attendingCeremony: true,
        attendingReception: true,
        numberOfGuests: 1,
        respondedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        invitationId,
        guestId
      };

      prismaMock.guest.findUnique.mockResolvedValue({
        id: guestId,
        rsvp: mockRSVP
      } as any);

      const response = await request(app)
        .get(`/api/rsvp/${inviteToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', RSVPStatus.PENDING);
    });

    it('should return 404 for invalid invite token', async () => {
      prismaMock.guest.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/rsvp/invalid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invitations/:id/rsvps', () => {
    it('should list all RSVPs with complete guest details', async () => {
      // Mock de l'invitation
      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId
      } as any);

      // Mock des RSVPs avec détails des invités
      const mockRSVPs = [
        {
          id: 'rsvp-1',
          status: RSVPStatus.CONFIRMED,
          numberOfGuests: 2,
          guest: {
            firstName: 'Guest',
            lastName: '1',
            email: 'guest1@test.com',
            isVIP: true,
            plusOne: true,
            plusOneName: 'Partner One',
            dietaryRestrictions: 'Vegan'
          }
        },
        {
          id: 'rsvp-2',
          status: RSVPStatus.CONFIRMED,
          numberOfGuests: 1,
          guest: {
            firstName: 'Guest',
            lastName: '2',
            email: 'guest2@test.com',
            phone: '+33123456789',
            plusOne: false
          }
        }
      ];

      prismaMock.rSVP.findMany.mockResolvedValue(mockRSVPs as any);

      const response = await request(app)
        .get(`/api/invitations/${invitationId}/rsvps`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Vérifier le premier invité (avec plus-one et statut VIP)
      const vipGuest = response.body.find((r: any) => r.guest.isVIP);
      expect(vipGuest).toBeTruthy();
      expect(vipGuest.guest).toMatchObject({
        firstName: 'Guest',
        lastName: '1',
        email: 'guest1@test.com',
        isVIP: true,
        plusOne: true,
        plusOneName: 'Partner One',
        dietaryRestrictions: 'Vegan'
      });
      expect(vipGuest.numberOfGuests).toBe(2);

      // Vérifier le second invité
      const regularGuest = response.body.find((r: any) => !r.guest.isVIP);
      expect(regularGuest).toBeTruthy();
      expect(regularGuest.guest).toMatchObject({
        firstName: 'Guest',
        lastName: '2',
        email: 'guest2@test.com',
        phone: '+33123456789',
        plusOne: false
      });
      expect(regularGuest.numberOfGuests).toBe(1);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/invitations/${invitationId}/rsvps`);

      expect(response.status).toBe(401);
    });
  });
}); 