import request from 'supertest';
import app from '@/app';
import { InvitationStatus, Design, Invitation } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prismaMock } from './mocks/prisma.mock';

describe('Invitation Routes', () => {
  let authToken: string;
  let userId: string;
  let invitationId: string;
  let designId: string;

  beforeEach(() => {
    // Réinitialiser les données de test
    userId = 'test-user-id';
    invitationId = 'test-invitation-id';
    designId = 'test-design-id';
    authToken = jwt.sign({ id: userId }, process.env['JWT_SECRET'] || 'test-secret');
  });

  describe('POST /api/invitations', () => {
    it('should create a new invitation', async () => {
      const mockDesign: Design = {
        id: designId,
        name: 'Test Design',
        previewUrl: 'https://example.com/preview.jpg',
        description: 'Test Design Description',
        isActive: true,
        isPremium: false,
        price: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

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
        designId
      };

      prismaMock.design.findUnique.mockResolvedValue(mockDesign);
      prismaMock.invitation.create.mockResolvedValue(mockInvitation);

      const response = await request(app)
        .post('/api/invitations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Wedding',
          weddingDate: '2024-12-31',
          venueName: 'Test Venue',
          venueAddress: 'Test Address',
          designId: designId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Wedding');
      expect(response.body.status).toBe(InvitationStatus.DRAFT);
    });

    it('should fail with invalid design ID', async () => {
      prismaMock.design.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/invitations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Wedding',
          weddingDate: '2024-12-31',
          venueName: 'Test Venue',
          venueAddress: 'Test Address',
          designId: 'invalid-design-id'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Design non trouvé');
    });
  });

  describe('GET /api/invitations/:id', () => {
    it('should get invitation by ID', async () => {
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(mockInvitation);

      const response = await request(app)
        .get(`/api/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', invitationId);
      expect(response.body.title).toBe('Test Wedding');
    });

    it('should return 404 for non-existent invitation', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/invitations/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Invitation non trouvée');
    });
  });

  describe('PATCH /api/invitations/:id', () => {
    it('should update invitation', async () => {
      const updatedInvitation: Invitation = {
        id: invitationId,
        title: 'Updated Wedding',
        description: 'Updated description',
        weddingDate: new Date('2024-12-31'),
        ceremonyTime: null,
        receptionTime: null,
        venueName: 'Updated Venue',
        venueAddress: 'Updated Address',
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue({ ...updatedInvitation, title: 'Test Wedding' });
      prismaMock.invitation.update.mockResolvedValue(updatedInvitation);

      const response = await request(app)
        .patch(`/api/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Wedding',
          description: 'Updated description',
          venueName: 'Updated Venue',
          venueAddress: 'Updated Address'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Wedding');
      expect(response.body.venueName).toBe('Updated Venue');
    });

    it('should prevent updating published invitation', async () => {
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(publishedInvitation);

      const response = await request(app)
        .patch(`/api/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Wedding'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Impossible de modifier une invitation publiée');
    });
  });

  describe('DELETE /api/invitations/:id', () => {
    it('should delete invitation', async () => {
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(mockInvitation);
      prismaMock.invitation.delete.mockResolvedValue(mockInvitation);

      const response = await request(app)
        .delete(`/api/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should prevent deleting published invitation', async () => {
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(publishedInvitation);

      const response = await request(app)
        .delete(`/api/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Impossible de supprimer une invitation publiée');
    });
  });

  describe('POST /api/invitations/:id/publish', () => {
    it('should publish invitation', async () => {
      const draftInvitation: Invitation = {
        id: invitationId,
        title: 'Draft Wedding',
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
        designId
      };

      const publishedInvitation = {
        ...draftInvitation,
        status: InvitationStatus.PUBLISHED
      };

      prismaMock.invitation.findFirst.mockResolvedValue(draftInvitation);
      prismaMock.invitation.update.mockResolvedValue(publishedInvitation);

      const response = await request(app)
        .post(`/api/invitations/${invitationId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(InvitationStatus.PUBLISHED);
    });

    it('should prevent publishing already published invitation', async () => {
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
        designId
      };

      prismaMock.invitation.findFirst.mockResolvedValue(publishedInvitation);

      const response = await request(app)
        .post(`/api/invitations/${invitationId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'L\'invitation est déjà publiée');
    });
  });
}); 