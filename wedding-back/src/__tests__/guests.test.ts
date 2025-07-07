import request from 'supertest';
import app from '@/app';
import { Guest, Invitation, InvitationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prismaMock } from './mocks/prisma.mock';

describe('Guest Routes', () => {
  let authToken: string;
  let userId: string;
  let invitationId: string;
  let guestId: string;

  beforeEach(() => {
    // Réinitialiser les données de test
    userId = 'test-user-id';
    invitationId = 'test-invitation-id';
    guestId = 'test-guest-id';
    authToken = jwt.sign({ id: userId }, process.env['JWT_SECRET'] || 'test-secret');
  });

  describe('POST /api/invitations/:id/guests', () => {
    it('should create a new guest', async () => {
      const mockInvitation: Invitation = {
        id: invitationId,
        title: 'Test Wedding',
        description: null,
        weddingDate: new Date('2024-12-31'),
        ceremonyTime: null,
        receptionTime: null,
        venueName: 'Test Venue',
        venueAddress: 'Test Address',
        venueCoordinates: null,
        customDomain: null,
        status: InvitationStatus.DRAFT,
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

      const mockGuest: Guest = {
        id: guestId,
        firstName: 'Test',
        lastName: 'Guest',
        email: 'test.guest@example.com',
        phone: '+33123456789',
        isVIP: true,
        dietaryRestrictions: 'Vegan',
        plusOne: true,
        plusOneName: 'Partner Name',
        inviteToken: 'generated-token',
        usedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        invitationId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(mockInvitation);
      prismaMock.guest.create.mockResolvedValue(mockGuest);

      const response = await request(app)
        .post(`/api/invitations/${invitationId}/guests`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Guest',
          email: 'test.guest@example.com',
          phone: '+33123456789',
          isVIP: true,
          dietaryRestrictions: 'Vegan',
          plusOne: true,
          plusOneName: 'Partner Name'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('Test');
      expect(response.body.lastName).toBe('Guest');
      expect(response.body.email).toBe('test.guest@example.com');
      expect(response.body.isVIP).toBe(true);
      expect(response.body.plusOne).toBe(true);
      expect(response.body.plusOneName).toBe('Partner Name');
      expect(response.body).toHaveProperty('inviteToken');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post(`/api/invitations/${invitationId}/guests`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Guest',
          email: 'invalid-email',
          plusOne: false
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('email')
        })
      );
    });

    it('should fail with published invitation', async () => {
      const publishedInvitation: Invitation = {
        id: invitationId,
        title: 'Published Wedding',
        description: null,
        weddingDate: new Date('2024-12-31'),
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

      prismaMock.invitation.findFirst.mockResolvedValue(publishedInvitation);

      const response = await request(app)
        .post(`/api/invitations/${invitationId}/guests`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Guest',
          email: 'test.guest@example.com',
          plusOne: false
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Impossible de modifier une invitation publiée');
    });
  });

  describe('GET /api/invitations/:id/guests', () => {
    it('should list all guests', async () => {
      const mockGuests = [
        {
          id: 'guest-1',
          firstName: 'Guest',
          lastName: 'One',
          email: 'guest.one@example.com',
          phone: '+33123456789',
          isVIP: true,
          dietaryRestrictions: 'Vegan',
          plusOne: true,
          plusOneName: 'Partner One',
          inviteToken: 'token-1',
          usedAt: null,
          rsvp: {
            status: 'CONFIRMED',
            numberOfGuests: 2
          }
        },
        {
          id: 'guest-2',
          firstName: 'Guest',
          lastName: 'Two',
          email: 'guest.two@example.com',
          phone: null,
          isVIP: false,
          dietaryRestrictions: null,
          plusOne: false,
          plusOneName: null,
          inviteToken: 'token-2',
          usedAt: new Date(),
          rsvp: {
            status: 'DECLINED',
            numberOfGuests: 1
          }
        }
      ];

      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId
      } as any);

      prismaMock.guest.findMany.mockResolvedValue(mockGuests as any);

      const response = await request(app)
        .get(`/api/invitations/${invitationId}/guests`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Vérifier le premier invité
      const vipGuest = response.body.find((g: any) => g.isVIP);
      expect(vipGuest).toBeTruthy();
      expect(vipGuest).toMatchObject({
        firstName: 'Guest',
        lastName: 'One',
        email: 'guest.one@example.com',
        isVIP: true,
        plusOne: true,
        plusOneName: 'Partner One',
        dietaryRestrictions: 'Vegan'
      });
      expect(vipGuest.rsvp.numberOfGuests).toBe(2);

      // Vérifier le second invité
      const regularGuest = response.body.find((g: any) => !g.isVIP);
      expect(regularGuest).toBeTruthy();
      expect(regularGuest).toMatchObject({
        firstName: 'Guest',
        lastName: 'Two',
        email: 'guest.two@example.com',
        isVIP: false,
        plusOne: false
      });
      expect(regularGuest.rsvp.numberOfGuests).toBe(1);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/invitations/${invitationId}/guests`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/invitations/:id/guests/:guestId', () => {
    it('should update guest details', async () => {
      const mockGuest: Guest = {
        id: guestId,
        firstName: 'Updated',
        lastName: 'Guest',
        email: 'updated.guest@example.com',
        phone: '+33987654321',
        isVIP: true,
        dietaryRestrictions: 'Gluten-free',
        plusOne: true,
        plusOneName: 'New Partner',
        inviteToken: 'test-token',
        usedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        invitationId
      };

      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId,
        status: InvitationStatus.DRAFT
      } as any);

      prismaMock.guest.findUnique.mockResolvedValue({ ...mockGuest, firstName: 'Original' });
      prismaMock.guest.update.mockResolvedValue(mockGuest);

      const response = await request(app)
        .patch(`/api/invitations/${invitationId}/guests/${guestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          phone: '+33987654321',
          dietaryRestrictions: 'Gluten-free',
          plusOneName: 'New Partner'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.phone).toBe('+33987654321');
      expect(response.body.dietaryRestrictions).toBe('Gluten-free');
      expect(response.body.plusOneName).toBe('New Partner');
    });

    it('should fail with published invitation', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId,
        status: InvitationStatus.PUBLISHED
      } as any);

      const response = await request(app)
        .patch(`/api/invitations/${invitationId}/guests/${guestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Impossible de modifier une invitation publiée');
    });
  });

  describe('DELETE /api/invitations/:id/guests/:guestId', () => {
    it('should delete guest', async () => {
      const mockGuest: Guest = {
        id: guestId,
        firstName: 'To',
        lastName: 'Delete',
        email: 'to.delete@example.com',
        phone: null,
        isVIP: false,
        dietaryRestrictions: null,
        plusOne: false,
        plusOneName: null,
        inviteToken: 'delete-token',
        usedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        invitationId
      };

      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId,
        status: InvitationStatus.DRAFT
      } as any);

      prismaMock.guest.findUnique.mockResolvedValue(mockGuest);
      prismaMock.guest.delete.mockResolvedValue(mockGuest);

      const response = await request(app)
        .delete(`/api/invitations/${invitationId}/guests/${guestId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail with published invitation', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId,
        status: InvitationStatus.PUBLISHED
      } as any);

      const response = await request(app)
        .delete(`/api/invitations/${invitationId}/guests/${guestId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Impossible de modifier une invitation publiée');
    });

    it('should fail with non-existent guest', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({
        id: invitationId,
        userId,
        status: InvitationStatus.DRAFT
      } as any);

      prismaMock.guest.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/invitations/${invitationId}/guests/${guestId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Invité non trouvé');
    });
  });
}); 