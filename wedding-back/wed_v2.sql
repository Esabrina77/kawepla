PGDMP      	                }           wedding_invitations    17.5    17.5 a    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                        0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16542    wedding_invitations    DATABASE     �   CREATE DATABASE wedding_invitations WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'French_France.1252';
 #   DROP DATABASE wedding_invitations;
                     weduser    false                        2615    62401    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     weduser    false                       0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        weduser    false    5                       0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        weduser    false    5            ~           1247    62584    ConversationStatus    TYPE     `   CREATE TYPE public."ConversationStatus" AS ENUM (
    'ACTIVE',
    'ARCHIVED',
    'CLOSED'
);
 '   DROP TYPE public."ConversationStatus";
       public               weduser    false    5            f           1247    62436    InvitationStatus    TYPE     `   CREATE TYPE public."InvitationStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);
 %   DROP TYPE public."InvitationStatus";
       public               weduser    false    5            �           1247    62658    InvitationType    TYPE     Q   CREATE TYPE public."InvitationType" AS ENUM (
    'PERSONAL',
    'SHAREABLE'
);
 #   DROP TYPE public."InvitationType";
       public               weduser    false    5            �           1247    62750    MessageType    TYPE     `   CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'RSVP_NOTIFICATION',
    'SYSTEM'
);
     DROP TYPE public."MessageType";
       public               weduser    false    5            �           1247    62740    PhotoStatus    TYPE     j   CREATE TYPE public."PhotoStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PUBLIC'
);
     DROP TYPE public."PhotoStatus";
       public               weduser    false    5            c           1247    62428 
   RSVPStatus    TYPE     \   CREATE TYPE public."RSVPStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'DECLINED'
);
    DROP TYPE public."RSVPStatus";
       public               weduser    false    5            �           1247    62734    ShareableLinkStatus    TYPE     O   CREATE TYPE public."ShareableLinkStatus" AS ENUM (
    'SHARED',
    'USED'
);
 (   DROP TYPE public."ShareableLinkStatus";
       public               weduser    false    5            �           1247    62820    SubscriptionStatus    TYPE     q   CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'CANCELED',
    'EXPIRED',
    'PAST_DUE'
);
 '   DROP TYPE public."SubscriptionStatus";
       public               weduser    false    5            �           1247    62830    SubscriptionTier    TYPE     y   CREATE TYPE public."SubscriptionTier" AS ENUM (
    'FREE',
    'ESSENTIAL',
    'ELEGANT',
    'PREMIUM',
    'LUXE'
);
 %   DROP TYPE public."SubscriptionTier";
       public               weduser    false    5            `           1247    62412    UserRole    TYPE     R   CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'COUPLE',
    'GUEST'
);
    DROP TYPE public."UserRole";
       public               weduser    false    5            �            1259    62402    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);
 &   DROP TABLE public._prisma_migrations;
       public         heap r       weduser    false    5            �            1259    62602    conversations    TABLE     �  CREATE TABLE public.conversations (
    id text NOT NULL,
    "userId" text NOT NULL,
    "invitationId" text NOT NULL,
    "adminId" text,
    status public."ConversationStatus" DEFAULT 'ACTIVE'::public."ConversationStatus" NOT NULL,
    "lastMessageAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 !   DROP TABLE public.conversations;
       public         heap r       weduser    false    894    894    5            �            1259    62463    designs    TABLE     �  CREATE TABLE public.designs (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "isPremium" boolean DEFAULT false NOT NULL,
    price double precision,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    template jsonb NOT NULL,
    styles jsonb NOT NULL,
    components jsonb,
    variables jsonb,
    version text DEFAULT '1.0.0'::text NOT NULL,
    "customFonts" jsonb,
    "backgroundImage" text,
    "backgroundImageRequired" boolean DEFAULT false NOT NULL,
    "previewImages" jsonb
);
    DROP TABLE public.designs;
       public         heap r       weduser    false    5            �            1259    62573    email_verifications    TABLE     ,  CREATE TABLE public.email_verifications (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 '   DROP TABLE public.email_verifications;
       public         heap r       weduser    false    5            �            1259    62485    guests    TABLE     '  CREATE TABLE public.guests (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    "isVIP" boolean DEFAULT false NOT NULL,
    "dietaryRestrictions" text,
    "plusOne" boolean DEFAULT false NOT NULL,
    "plusOneName" text,
    "inviteToken" text NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "invitationId" text NOT NULL,
    "invitationSentAt" timestamp(3) without time zone,
    "invitationType" public."InvitationType" DEFAULT 'PERSONAL'::public."InvitationType" NOT NULL,
    "sharedLinkUsed" boolean DEFAULT false NOT NULL,
    "profilePhotoUrl" text
);
    DROP TABLE public.guests;
       public         heap r       weduser    false    903    5    903            �            1259    62475    invitations    TABLE     A  CREATE TABLE public.invitations (
    id text NOT NULL,
    title text,
    description text,
    "weddingDate" timestamp(3) without time zone NOT NULL,
    "ceremonyTime" text,
    "receptionTime" text,
    "venueName" text NOT NULL,
    "venueAddress" text NOT NULL,
    "venueCoordinates" text,
    "customDomain" text,
    status public."InvitationStatus" DEFAULT 'DRAFT'::public."InvitationStatus" NOT NULL,
    photos jsonb[] DEFAULT ARRAY[]::jsonb[],
    program jsonb,
    restrictions text,
    languages text[] DEFAULT ARRAY['fr'::text],
    "maxGuests" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "designId" text NOT NULL,
    "blessingText" text DEFAULT 'Avec leurs familles'::text,
    contact text,
    "coupleName" text NOT NULL,
    "dressCode" text DEFAULT 'Tenue de soirée souhaitée'::text,
    "invitationText" text DEFAULT 'Vous êtes cordialement invités'::text,
    message text DEFAULT 'Votre présence sera notre plus beau cadeau'::text,
    "moreInfo" text,
    "rsvpDate" timestamp(3) without time zone,
    "rsvpDetails" text DEFAULT 'Merci de confirmer votre présence'::text,
    "rsvpForm" text DEFAULT 'RSVP requis'::text,
    "welcomeMessage" text DEFAULT 'Bienvenue à notre mariage'::text,
    "shareableEnabled" boolean DEFAULT false NOT NULL,
    "shareableExpiresAt" timestamp(3) without time zone,
    "shareableMaxUses" integer DEFAULT 50,
    "shareableToken" text,
    "shareableUsedCount" integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.invitations;
       public         heap r       weduser    false    870    870    5            �            1259    62612    messages    TABLE     �  CREATE TABLE public.messages (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    "messageType" public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.messages;
       public         heap r       weduser    false    915    5    915            �            1259    62765    password_resets    TABLE     A  CREATE TABLE public.password_resets (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);
 #   DROP TABLE public.password_resets;
       public         heap r       weduser    false    5            �            1259    62774    photo_albums    TABLE     a  CREATE TABLE public.photo_albums (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "coverPhotoUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invitationId" text NOT NULL
);
     DROP TABLE public.photo_albums;
       public         heap r       weduser    false    5            �            1259    62783    photos    TABLE     V  CREATE TABLE public.photos (
    id text NOT NULL,
    "originalUrl" text NOT NULL,
    "compressedUrl" text,
    "thumbnailUrl" text,
    filename text NOT NULL,
    size integer NOT NULL,
    width integer,
    height integer,
    "mimeType" text NOT NULL,
    status public."PhotoStatus" DEFAULT 'PENDING'::public."PhotoStatus" NOT NULL,
    caption text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "albumId" text NOT NULL,
    "uploadedById" text
);
    DROP TABLE public.photos;
       public         heap r       weduser    false    912    912    5            �            1259    62455    refresh_tokens    TABLE     �   CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 "   DROP TABLE public.refresh_tokens;
       public         heap r       weduser    false    5            �            1259    62495    rsvps    TABLE     O  CREATE TABLE public.rsvps (
    id text NOT NULL,
    status public."RSVPStatus" DEFAULT 'PENDING'::public."RSVPStatus" NOT NULL,
    message text,
    "attendingCeremony" boolean DEFAULT true NOT NULL,
    "attendingReception" boolean DEFAULT true NOT NULL,
    "numberOfGuests" integer DEFAULT 1 NOT NULL,
    "respondedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invitationId" text NOT NULL,
    "guestId" text NOT NULL,
    "profilePhotoUrl" text
);
    DROP TABLE public.rsvps;
       public         heap r       weduser    false    867    5    867            �            1259    62669    shareable_links    TABLE     /  CREATE TABLE public.shareable_links (
    id text NOT NULL,
    token text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "maxUses" integer DEFAULT 50 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invitationId" text NOT NULL,
    "guestId" text,
    status public."ShareableLinkStatus" DEFAULT 'SHARED'::public."ShareableLinkStatus" NOT NULL
);
 #   DROP TABLE public.shareable_links;
       public         heap r       weduser    false    909    909    5            �            1259    62865    subscriptions    TABLE     p  CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    tier public."SubscriptionTier" NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "stripeSubscriptionId" text,
    "stripePriceId" text,
    "stripeCustomerId" text,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 !   DROP TABLE public.subscriptions;
       public         heap r       weduser    false    927    927    930    5            �            1259    62857    user_additional_services    TABLE       CREATE TABLE public.user_additional_services (
    id text NOT NULL,
    "userId" text NOT NULL,
    "serviceId" text NOT NULL,
    quantity integer NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 ,   DROP TABLE public.user_additional_services;
       public         heap r       weduser    false    5            �            1259    62443    users    TABLE     A  CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" DEFAULT 'COUPLE'::public."UserRole" NOT NULL,
    "subscriptionTier" public."SubscriptionTier" DEFAULT 'FREE'::public."SubscriptionTier" NOT NULL,
    "subscriptionEndDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "stripeCustomerId" text,
    "stripePriceId" text,
    "stripeSubscriptionId" text,
    "subscriptionStatus" public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL
);
    DROP TABLE public.users;
       public         heap r       weduser    false    864    930    927    927    930    864    5            �          0    62402    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               weduser    false    217   I�       �          0    62602    conversations 
   TABLE DATA           �   COPY public.conversations (id, "userId", "invitationId", "adminId", status, "lastMessageAt", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    225   ��       �          0    62463    designs 
   TABLE DATA             COPY public.designs (id, name, description, category, tags, "isActive", "isPremium", price, "createdBy", "createdAt", "updatedAt", template, styles, components, variables, version, "customFonts", "backgroundImage", "backgroundImageRequired", "previewImages") FROM stdin;
    public               weduser    false    220   O�       �          0    62573    email_verifications 
   TABLE DATA           b   COPY public.email_verifications (id, email, code, "expiresAt", verified, "createdAt") FROM stdin;
    public               weduser    false    224   ��       �          0    62485    guests 
   TABLE DATA             COPY public.guests (id, "firstName", "lastName", email, phone, "isVIP", "dietaryRestrictions", "plusOne", "plusOneName", "inviteToken", "usedAt", "createdAt", "updatedAt", "userId", "invitationId", "invitationSentAt", "invitationType", "sharedLinkUsed", "profilePhotoUrl") FROM stdin;
    public               weduser    false    222   ��       �          0    62475    invitations 
   TABLE DATA             COPY public.invitations (id, title, description, "weddingDate", "ceremonyTime", "receptionTime", "venueName", "venueAddress", "venueCoordinates", "customDomain", status, photos, program, restrictions, languages, "maxGuests", "createdAt", "updatedAt", "userId", "designId", "blessingText", contact, "coupleName", "dressCode", "invitationText", message, "moreInfo", "rsvpDate", "rsvpDetails", "rsvpForm", "welcomeMessage", "shareableEnabled", "shareableExpiresAt", "shareableMaxUses", "shareableToken", "shareableUsedCount") FROM stdin;
    public               weduser    false    221   ��       �          0    62612    messages 
   TABLE DATA           �   COPY public.messages (id, "conversationId", "senderId", content, "messageType", "isRead", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    226   >�       �          0    62765    password_resets 
   TABLE DATA           e   COPY public.password_resets (id, email, token, "expiresAt", used, "createdAt", "userId") FROM stdin;
    public               weduser    false    228   [�       �          0    62774    photo_albums 
   TABLE DATA           �   COPY public.photo_albums (id, title, description, "isPublic", "coverPhotoUrl", "createdAt", "updatedAt", "invitationId") FROM stdin;
    public               weduser    false    229   x�       �          0    62783    photos 
   TABLE DATA           �   COPY public.photos (id, "originalUrl", "compressedUrl", "thumbnailUrl", filename, size, width, height, "mimeType", status, caption, "uploadedAt", "approvedAt", "publishedAt", "albumId", "uploadedById") FROM stdin;
    public               weduser    false    230   ��       �          0    62455    refresh_tokens 
   TABLE DATA           W   COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
    public               weduser    false    219   ��       �          0    62495    rsvps 
   TABLE DATA           �   COPY public.rsvps (id, status, message, "attendingCeremony", "attendingReception", "numberOfGuests", "respondedAt", "createdAt", "updatedAt", "invitationId", "guestId", "profilePhotoUrl") FROM stdin;
    public               weduser    false    223   ��       �          0    62669    shareable_links 
   TABLE DATA           �   COPY public.shareable_links (id, token, "isActive", "maxUses", "usedCount", "expiresAt", "createdAt", "updatedAt", "invitationId", "guestId", status) FROM stdin;
    public               weduser    false    227   D�       �          0    62865    subscriptions 
   TABLE DATA           �   COPY public.subscriptions (id, "userId", tier, status, "stripeSubscriptionId", "stripePriceId", "stripeCustomerId", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    232   e�       �          0    62857    user_additional_services 
   TABLE DATA           j   COPY public.user_additional_services (id, "userId", "serviceId", quantity, type, "createdAt") FROM stdin;
    public               weduser    false    231   ��       �          0    62443    users 
   TABLE DATA             COPY public.users (id, email, password, "firstName", "lastName", role, "subscriptionTier", "subscriptionEndDate", "isActive", "emailVerified", "createdAt", "updatedAt", "stripeCustomerId", "stripePriceId", "stripeSubscriptionId", "subscriptionStatus") FROM stdin;
    public               weduser    false    218   
�                  2606    62410 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 weduser    false    217            4           2606    62611     conversations conversations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_pkey;
       public                 weduser    false    225            %           2606    62474    designs designs_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.designs DROP CONSTRAINT designs_pkey;
       public                 weduser    false    220            2           2606    62581 ,   email_verifications email_verifications_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.email_verifications DROP CONSTRAINT email_verifications_pkey;
       public                 weduser    false    224            -           2606    62494    guests guests_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.guests DROP CONSTRAINT guests_pkey;
       public                 weduser    false    222            (           2606    62484    invitations invitations_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.invitations DROP CONSTRAINT invitations_pkey;
       public                 weduser    false    221            6           2606    62621    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 weduser    false    226            <           2606    62773 $   password_resets password_resets_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.password_resets DROP CONSTRAINT password_resets_pkey;
       public                 weduser    false    228            ?           2606    62782    photo_albums photo_albums_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.photo_albums
    ADD CONSTRAINT photo_albums_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.photo_albums DROP CONSTRAINT photo_albums_pkey;
       public                 weduser    false    229            A           2606    62791    photos photos_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.photos DROP CONSTRAINT photos_pkey;
       public                 weduser    false    230            "           2606    62462 "   refresh_tokens refresh_tokens_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
       public                 weduser    false    219            0           2606    62506    rsvps rsvps_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT rsvps_pkey;
       public                 weduser    false    223            9           2606    62679 $   shareable_links shareable_links_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT shareable_links_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.shareable_links DROP CONSTRAINT shareable_links_pkey;
       public                 weduser    false    227            E           2606    62874     subscriptions subscriptions_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.subscriptions DROP CONSTRAINT subscriptions_pkey;
       public                 weduser    false    232            C           2606    62864 6   user_additional_services user_additional_services_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.user_additional_services
    ADD CONSTRAINT user_additional_services_pkey PRIMARY KEY (id);
 `   ALTER TABLE ONLY public.user_additional_services DROP CONSTRAINT user_additional_services_pkey;
       public                 weduser    false    231                        2606    62454    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 weduser    false    218            *           1259    62582    guests_invitationId_email_key    INDEX     j   CREATE UNIQUE INDEX "guests_invitationId_email_key" ON public.guests USING btree ("invitationId", email);
 3   DROP INDEX public."guests_invitationId_email_key";
       public                 weduser    false    222    222            +           1259    62521    guests_inviteToken_key    INDEX     [   CREATE UNIQUE INDEX "guests_inviteToken_key" ON public.guests USING btree ("inviteToken");
 ,   DROP INDEX public."guests_inviteToken_key";
       public                 weduser    false    222            &           1259    62520    invitations_customDomain_key    INDEX     g   CREATE UNIQUE INDEX "invitations_customDomain_key" ON public.invitations USING btree ("customDomain");
 2   DROP INDEX public."invitations_customDomain_key";
       public                 weduser    false    221            )           1259    62668    invitations_shareableToken_key    INDEX     k   CREATE UNIQUE INDEX "invitations_shareableToken_key" ON public.invitations USING btree ("shareableToken");
 4   DROP INDEX public."invitations_shareableToken_key";
       public                 weduser    false    221            =           1259    62792    password_resets_token_key    INDEX     ]   CREATE UNIQUE INDEX password_resets_token_key ON public.password_resets USING btree (token);
 -   DROP INDEX public.password_resets_token_key;
       public                 weduser    false    228            #           1259    62519    refresh_tokens_token_key    INDEX     [   CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);
 ,   DROP INDEX public.refresh_tokens_token_key;
       public                 weduser    false    219            .           1259    62522    rsvps_guestId_key    INDEX     Q   CREATE UNIQUE INDEX "rsvps_guestId_key" ON public.rsvps USING btree ("guestId");
 '   DROP INDEX public."rsvps_guestId_key";
       public                 weduser    false    223            7           1259    62793    shareable_links_guestId_key    INDEX     e   CREATE UNIQUE INDEX "shareable_links_guestId_key" ON public.shareable_links USING btree ("guestId");
 1   DROP INDEX public."shareable_links_guestId_key";
       public                 weduser    false    227            :           1259    62680    shareable_links_token_key    INDEX     ]   CREATE UNIQUE INDEX shareable_links_token_key ON public.shareable_links USING btree (token);
 -   DROP INDEX public.shareable_links_token_key;
       public                 weduser    false    227            F           1259    62875 &   subscriptions_stripeSubscriptionId_key    INDEX     {   CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");
 <   DROP INDEX public."subscriptions_stripeSubscriptionId_key";
       public                 weduser    false    232                       1259    62518    users_email_key    INDEX     I   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
 #   DROP INDEX public.users_email_key;
       public                 weduser    false    218            O           2606    62642 (   conversations conversations_adminId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_adminId_fkey";
       public               weduser    false    4896    218    225            P           2606    62637 -   conversations conversations_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_invitationId_fkey";
       public               weduser    false    225    4904    221            Q           2606    62632 '   conversations conversations_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_userId_fkey";
       public               weduser    false    225    4896    218            H           2606    62528    designs designs_createdBy_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.designs
    ADD CONSTRAINT "designs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.designs DROP CONSTRAINT "designs_createdBy_fkey";
       public               weduser    false    220    218    4896            K           2606    62548    guests guests_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.guests DROP CONSTRAINT "guests_invitationId_fkey";
       public               weduser    false    222    221    4904            L           2606    62543    guests guests_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.guests DROP CONSTRAINT "guests_userId_fkey";
       public               weduser    false    4896    218    222            I           2606    62538 %   invitations invitations_designId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_designId_fkey" FOREIGN KEY ("designId") REFERENCES public.designs(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.invitations DROP CONSTRAINT "invitations_designId_fkey";
       public               weduser    false    220    221    4901            J           2606    62533 #   invitations invitations_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.invitations DROP CONSTRAINT "invitations_userId_fkey";
       public               weduser    false    221    218    4896            R           2606    62647 %   messages messages_conversationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.messages DROP CONSTRAINT "messages_conversationId_fkey";
       public               weduser    false    4916    226    225            S           2606    62652    messages messages_senderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.messages DROP CONSTRAINT "messages_senderId_fkey";
       public               weduser    false    4896    218    226            V           2606    62799 +   password_resets password_resets_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.password_resets DROP CONSTRAINT "password_resets_userId_fkey";
       public               weduser    false    218    228    4896            W           2606    62804 +   photo_albums photo_albums_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.photo_albums
    ADD CONSTRAINT "photo_albums_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.photo_albums DROP CONSTRAINT "photo_albums_invitationId_fkey";
       public               weduser    false    229    221    4904            X           2606    62809    photos photos_albumId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.photos
    ADD CONSTRAINT "photos_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES public.photo_albums(id) ON UPDATE CASCADE ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.photos DROP CONSTRAINT "photos_albumId_fkey";
       public               weduser    false    230    229    4927            Y           2606    62814    photos photos_uploadedById_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.photos
    ADD CONSTRAINT "photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.photos DROP CONSTRAINT "photos_uploadedById_fkey";
       public               weduser    false    222    230    4909            G           2606    62523 )   refresh_tokens refresh_tokens_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT "refresh_tokens_userId_fkey";
       public               weduser    false    218    4896    219            M           2606    62558    rsvps rsvps_guestId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT "rsvps_guestId_fkey";
       public               weduser    false    222    223    4909            N           2606    62553    rsvps rsvps_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT "rsvps_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT "rsvps_invitationId_fkey";
       public               weduser    false    221    223    4904            T           2606    62794 ,   shareable_links shareable_links_guestId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT "shareable_links_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.shareable_links DROP CONSTRAINT "shareable_links_guestId_fkey";
       public               weduser    false    222    227    4909            U           2606    62681 1   shareable_links shareable_links_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT "shareable_links_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.shareable_links DROP CONSTRAINT "shareable_links_invitationId_fkey";
       public               weduser    false    227    221    4904            [           2606    62881 '   subscriptions subscriptions_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.subscriptions DROP CONSTRAINT "subscriptions_userId_fkey";
       public               weduser    false    232    4896    218            Z           2606    62876 =   user_additional_services user_additional_services_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_additional_services
    ADD CONSTRAINT "user_additional_services_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 i   ALTER TABLE ONLY public.user_additional_services DROP CONSTRAINT "user_additional_services_userId_fkey";
       public               weduser    false    231    4896    218            �   >  x��WYrc��f����� P�j�L��0��-J��;)��-[�� �'.Oȗ�ٹ4�9*�4�RkN��z���8�hv�£��\s��CH�ژE�X;d��sm)2����d� $%�%�!��믅~)�U��$���QeӒ�xz8=~������rs����K��Jͤ'-�S��Ia�U�'饶�7��Ǯ����C�j"�{�\{���6�p����1=3�6�c�y���?���i��-,W��˰݀g'�BI�i�<=�Tª�jV��my�յNƍ�XhWp�F�9����/���^�����Ą�������9�O���u��.��q���<���@�\q��;ya0#�颹4�j�9:p͙�V4k[��\��\;�墾^�6�M�'𮪫��\f/�>��5��p)1h����s=���|�s���+�Mg���~)ԓ[�������t��p@\tW��1h���͋�j��Z�BxWs�C&ۗO|��Y2��;�s|[���܂���*���L��.����q
^��K����-M6��!և�/ZYcս�.8���#S�}�q'o����թ�w*YĮ�����w�����j.�oQPhW̿�ZR�����d�9��ĦCYx����\x�mݥ��#o�z	�]s�k����$�k�-�>#s�wĸ o^��{H��m=��i���&3��{�aL�a)����:J�����s_�D�<���P��$P�]��$ֆ�٬12�6BZ���^�������|��Q�F�g �z9�"4��h�9Ǥ���B+֫�<��9j���l�J(���+N��uf�H5��%�>����#"��W</���7����� �����\�'�����RCD'�ŨwU^�P7l_"�l�_���M��x�Z��6����D�����?���ORΙ���G<��w�xwz���H/�c<���RG^]!*N�S5M2x ��#�"�v��Cc� i�s4�.�b	��V��{ծ1H��L<6��e<��=wي�b�_�s�~z��x���t����}�<i����6w8^ ���H�����R'�1�Q����ʼ� LF�KE�qZ��Z�g�b��y�&C��{��C���|7y���/���GzZs�SsGB��$Q�d�)H<�Q;w8���	*c��mB+R��g��س6�~�N�lA���ª���=/�3��~��&$4����(�RC;��L&B�A5����� �dP��]$�-/J�H�4���+
�)���qEU�)ƹ\�"�Bz���t�z���6+�
(ź��P*WR��{^����X���&cWf:|�bǚCg(K�`��fX���Pb)�k�3Ml�L��M������� �����M���Mv���ג���U��%#	�!3�0PF2@e�Q��G��B�W�;1��� �.�EF�Kk��F����ĄuR�Z��	����tw�x�ێC�k)V:Dҝ/��ʆ���2�A��(Q�rY�MXW�M��X\( f�3�/��[�V9/_��a~�%�2�7���#~=��}�	KQz��~��˗/�;(x�      �   �   x�����0Eg�� �(-݌qpq2NL�B�@Jy��-`�9��G�ƕ����(�iѳ���^��o�Z���J��`��3Lm��dq�OU��x�]��(����cZ $2	��0َJD������-��	��
�m���e~�Q���4�|&UB��vUL      �      x��}Ɏ#G��9�)!R�&)_IgB-@{���*e��T�.�3����Ɉ%�� 3�5�9�a���7�'[ݶ��͜���U�T�s[~�����Ͳ��E��I�(�|�^'O^�u�������ڬ�C�䳺]_m�v����]����/�c�E������:Zl�jՇ�­ֻm����zS�O��#���Ɋ�-��b��I���,{^��,�[����T�����yt��r}��V��??������j��ޮ䣬��:�����+t�훛j�}�f��Я?@�|t1�.�zA:��~s��!�>�l����5���ny��#�+컫����Ҿ|����a���ڬ��K4M-
��8��m����l��,v7��=U]�o�aW^���=�}��M��^i���k[g������M�_@�S�r٠o�����������e�>�i�/.ꦾ�m��J�v�-��lS/�=%{��`�2��?Pm������+Ԃ�-��Z,��vk�&BZ�]K�ńD(�-�H	P%2zX'z#�К�vo[8r����Ů���?�Dg��x��K����|���M��?�к���<�'�/�T��.�+@��ڒ����:�z|���X:��
���kDY��F��F�:�W5ڇ�f�_V���n����z{h�x�%y�_'b���M=ޢ�o�,�D�У׉�:~f|ܢ��Ef��xQ��#��(8W���W�o#���k����jn��n͗�ݺ�t��W�ݝXz�X�
o߾E���jk� ��뗻���E����z5W���iQ����${�?sS5W��_�Qu<�ȧ+�.��#�e�|}w[7+�_ҥ�rYo��6�����;�G6=٪_םpJ�6��HP��H�Ehʐ�:ԴO��w����Y���5����١uė�JVh��j�F<��$+�����Y����Kt5F���N�,Jq+�9z)��[�gQ!�J��4Kѭݚ>�f�8�	�7ş*���ſ'3{�{=n��%��}	�}���7I��������͸@w׈��3�n�~/�O����4�7�x��P�{q�96������.(���jŹ�a��/�S�ަ^�����Z�p�;v7������2����O�Q��k�j�Wu�h�x0����D�Ѵ�(e(�&�\���|��"E�"�:�F��;src��H3�{�n$E��0��,�͑u.����2���������{M)ݯ���77�՗���5���ڶ��A����U���s��n7Y�{�Cݩ��u w��m�x�<$��b.�%�_o.~���@o���.v������t�J���>�m�=�ϊb:�\���=m���b}�'+3�͖��)k�/�v�k����
Xfj�������]�J��z���}��m��U7��=|�n��j�K���f�����;� v��0��s~P���������2�/�	���q�;���N���֦��پmm�vj<S��|a4�(�G��z���K��?�6A~ �������oL(w"�f��u��cW��(S>j�H�i���X��r|�4�j�;K�����'�8%9 �U�J��g���9W�y�m�E)``��P�̟�f?£��$g��43�>$�����L��35��R~�|Ji���ӟ4uEz�Ft՝	�WEȪ������W��n��4<�E���C��HG�iۻ�C���c������v�j�&�b�����	�����>7����П>]�Pn:��� 5�I��M}�w�Z�-�z����Q�C&#"�밴oө��D~1�ŋ�K�_f��I}Ɉ�C��H]O��ۖi��<u�ˠ���:Y,���~�ԁsf�O��dUl�3�C,���,����ndv��>D��$�`�t�Q�:!�#�z/��$�9ƿl�
��x+8�Xr�|��,P2���d�t��Ժ�z�P�Tp $r��r,�2�hR�$+��ߞ�n�r��������xƨ�w��m�GN�&OSI�\�i�y�3v��)��j�䄭�u���zy9�%�nN��e6[,���1)w0�**D��7ק�O����GĬ�Cg%uj�B8l�t&���,��Y��Y&��Q�g��3����,J�sP�>��f꧶���ǞFyR�I��s}vW��N23�w�e�A�߄�(�bl´0�I�NR�ORaLR�'�v�mN��9�gX�l��&k(��mӤ�#z�f�z/� "�Fq�1�D�P���V�3G\"��"8�.�qL=J'��u��������D�;�l�e�1���H*A�EyS�0��(��0 ��{�S}R6�R�r�į�ڏ���5�{�wf��w�$C���ƒ��o^�$"��w�J���2���K����ު,h���/�v��&C�6Na��,zظ(�E?HJ�N���eY���+B4j`]6��¾_UR�pJWȗ��5)�w��vŝ��d�¢��B^�(<��Be��" �V�6B@ԛ�z��Ve+���t���M6�X(�"c�����W�`�cJB0t��\��,�Y^^jl9!�����=�_
7xo�x2g��l��n�-��1!Ng��I�,�h{7��'��2:����v���?n�%��r�[���tӎ�I��\�>�[R��F-C�K�]��V�(�c�f�^(>�46m`zA0qL`$�1��� y��p��1�o@Ł��F&�.>튘���r�(��T�Hy�N[#l��2il�4�xE�ص��6�[Ę6�C�ȩ��L�t�]���K��k"&�NJ�I��I��A�:��r�v��b�B
�d��R�*u)+>�kc��/�����%3@f�FC�y�����@d��+R/�u��й�0��p�9N�(�p��Heϭ�왒yh�K��Z+�
ոG�&\�3�Ę\�/qj��M!���k�-��Ą=n�=HI]Q���dm_���2�bD�JhM�J(��Qv�jvh�~�t�.�b.�*Q���4䝧�Xu(����.��_���d?����O�������O��b&"���C��N��X_�W^�Ɇ�7���{M;B��n���Y.�1��V��<B2u%V�H�*c;�W�p
RW|�Ԓ��;��0����82���K�WT�Jߝ�U���O׉�~]���p���&��ފw�GK�L�I�
�qA���4z��8�sR�+���\<y�k�6�lGꝟ|Z-�:�z�����/��:��ߣ��yM��O}�� �Ѣy�o���/�w�\U�C_)t�<C��g����W�ͲގI��Zlx^�:�|��Le�`������o����/��F�B��ƨ;q�<���_��qi#z3N���E�/�zM\�hV;ۮo�L�T*�fɋh��h��K�`�q�����|)��0f�>�ɴ4U�B�/v˺�X�W ��rk���ԗ�	,I1zwI��}�B�Uu��ܳ�|��/?�������շ��߾z}�񋯾���Wg���)�բ|^F�������Z�j��l�[ﭪ�l�[�U����Q�����b��t3���F�LqŜ͐s����Կ�˅O6;��ZL�(m��=6��1s�������۫z}�}����l���{D͇��>�����e�]s�A��+~݌n���'�����$V�ѯ�>����y��<$���au(*�Q���˨DwR�#�wR�yi`����l�Ȋ�\d	�仓������o��(��YL�E?f1n}雌��蝌<F��>H�+�9� ����>����3���n����:�T��F�AW����ЯL@)��/TIW���Y�%$?R��1_�؏�J���P�(�?�q��L)&���Ȋ���G@�/�U��=�Bp��M�Ă��5w��_�d��tQ�3Ʈ�eYpvmtȳ�e^�2� k�5H3w9-;���H瓖t9��/�S1��J��r�o)Uwt���8��K�4���K#dgF4��Xd��@LX;p�	�6�i�f�9]W�yy9�'�2��I�"Y�?]Z$t��k@�i�iY�Lb��N_��#d������t7�W��h�������%&�f�9u�'%{Y�Z1�X#((@6\�y��N�բ30    Zķg�o-VC:�v���Z�wߘ���3�pϫr��9"���m�����,&l���I�R]�����&�U�H��_vk�	����1�Ap�W�<����I���&%�k�Z�M�
#��;U�:�)�ۢ-bQ��9�.�aSxzO2Ӝ]jP6�n��A�r��,��0��F���]>nwB�o΅=S�i���֍�uW�:���_'��C�p��Y��n`��a�	�śq�|�����y7�P#�F��M�����2����΅oH��4^������U�?QCX�?	y�Ɵ���O�J���\=��חM}R�?��-2��Q�P�����3�Ϋj�D�QIͻ`G�毋8���*�?-�wO>�N_vz���6���?hj�li�:Li�X���m��S�jU�������M_X�x���".���R��Ƒ�1yb�x��U㺰���G�֌џ���1�"0���,�0���/�0}A|ݳE�@�^7�/��A��g� }-�1ǒRN�M�q�)���1ҵ%T�a�~���V��G�����|�����ME���?�"��vx �;�(2� ��R�X4�;���������B��yY�?��0.f����(@�ִ��-�bK���o|������ج�k������mp�X�:�bx�{ǴR�`��yg�H�ժ��9����3��z�pA(��ih�v�Z�J��/q��B�mRW����U\_��%~�^���'�k�H0�	II�}�>xĊ�LB[�s�#��/�l%_�,�i|�,�=�Y���Ƨ�h[6��QÀ�zՒ�N9��$>G�?�"}����!V������H�fM��7�R��Wh����ik��źY I� �'�Ž�{C���ɪ���N�����!�	�Q�Pw{hv?�F{��"c�3q�B�lt�C��C
�A��TiJ�>����t~�)QJ'�J_O���[�Z*�Ai�\@4��cS�BBbҺo�~�B`0x�Ic���jC=P���l�e�>	�k6C��"��r��Q��
��Dj�R�P��#$d�Q4ͬ1��(/�{Xn*�_)���wG�,�l�) �Lz�-� 40O�/�o�ߠ�F�?#@�h|�ZI?ω��=��S����t��'e�|N삅7h��&��H� �����7�Z�$Ei�Go�^�o��A��[
�Ǥ?m��k�ș"1=�䤴�k֏�ϔ�b���~���z*#l`ƹ�J��.��-���	��]>tp��"�CB�"M��a2�b*��FÉ��\�kI���t��HGE֑	c0���+c&��5%���\�rOT`z��q$0щ�
{E������
���}�����Ǩ��f͏��J�K;�l.TP�5e����𹳐NH��̂�{BF!g�ޭ���%?�"rϜJ�3gK�\�R-�k'�((RԿ�������1�=�if��m�Q>�D��8���uZi�Št�OP����2Мte�p쮩p_#F�����*1�0r^�� әj�Ņ��^�G�qﲳ�މ��|Kf�'�Xnӆ#�1�Ɨ�HV�7,�Hɤ���_��m֋��ځ�F��`��F%�H-|�����a7U�x #���(MG���yf�0�ʈ�ݚ�e�*����5�\ÿ%�m;ȱ�W�
g	2�C��$]�� �￿p҅�Ury��,1�z�,�Lr����A�Z�����K9�r�%AP��?m���A��Y�IvY�*25T�̡���(j�A�y3w��$�⽇u��5"Zh���""��<�1�� �甆����x���eOT��Zm�צP���Xj���ܴN�UP�K���4Vt��c{X��%G%YI)�D��|	�YZ��$U��3��:|RZQH����d#��lJ�s�g.���d�-��i�Z3�!Q�?����|]�^�� ���0�xݐJ+�4���.9��ɟ>��l��ڃ���/μE~�Wu-l�.Ky�#�)7r���������e�P���V�~(;�?�I=�N�*��nԎ�/a�I�_R)�7~dT�ղ�Z��l��V��P<f:���(ĹQ3�9��a��+V�衐��U+JΞ*Y`�̉�y"���k�N�LO�LH��
5Ϊ���R��I��6�Bp��r���[�gڜ� z_'$@��O�)��=z�4�'̟����ٯ_�D��+�3X���&��T%��o�ɮ���:�N���4G�է���n�L��WBz�«No�W��J�v?l�8��ҫ"�y��V�'��7�eD��;����6Z���B�t���t\G7��j�V���D�u�6�ݵx#ڤ9u��W�l�s����+��1c��Ww�[�$���Lp9�(oy�r���O(�A^�Y��U�ĝ���9_.����g���?��5;�6�/�
n����c�Uj}�y*_&*Ӭ�,ˬZE=Gneu�Y@�*��ϳ����U��W��<���,Ƨ_�;4��$OMm� ��	���YPy>/\UU�7�ؕ��٪\�K�K8��e"�6�7���. ��6$m�X��(��o����6�N�t6B?�J��%*{D�����B��-�k�Ǔ X�	�����=wV��6�|ax����1������x�(�t�<l��TB ��z�/��e��-�H
����"�o�vw�������G����IA}K9�"e[>Ye�|�ׁ�}�Cҳ ��#hú�]wvy��"$����w����u�/ӑnC6s��\�Vi��a�Z ���۸��ou2t�[��t ����ld��Rj�A�fP�Sa�NF�!~>����y��4}:�JU�� ���t8S�i�� �t�0$��V/N���qϰ'n����j�俬�̸�������ϹeW5���C�ٻ_�Q��	v�Q����¾Wg�qy��9���lR��;t��9���FCy<g���H����m6�=zM�Ɓ`I�c̝�6P��~�9lА��>l��L�05����C��4%|6��5ױ.�u��t���a;�n#pF)�[�^��d���5�	��u�>��3�CJog�m͑�H�3f�L��чM#��x*����$�?ncUs@���A�]�'Pk���g��!d���ȞbEYph��1��F�	���衮)�#%�qs�oYm6��z�f�(�:7��L��ң�HH�g��s�L�����~V~��j+4���[�'q�U�b�X���z��)��)�ǩ�u��<N].�˘��d��|i�?�|r��t]�4�f݌"�
QH��Im89� �
�i&�v�l89}�KeL���EB@i�����9;��LY|���$�H.�9�ZT+*}�D�d��D�a4e��1R�ܨ/�byM,�rX| �6����
�F����F��C5*$T��C5JOB5�G��H�Qj�ѭ�e&�;���I`L�m�#�C�(8Fg(�X��b����� h~��ŉ%���>s	����&�[�ދ%��)�_�6K��F�ʁ#E?��'w+O�O>!0@	�?.P4�@:�!�GOÊ<}l�?{�M����  �X2��I�?b+"`g���	��m�������A힛ي_�OI�e[~'�0S᱀'��#kM�|
���!)@Ζ�#0�^���X�bVx!T�_���D�� �q�q�OM�]Kc��8�c
��Q���oq����U#���i��~Nň��W��1��}������߼��������I��R6�.H&y}k@y�c!��
�l���(Ͳ�فæ֏�ˠ]�K��S�������0F���)c���^ ����]���c8v�������C�k�3K�t/�����[���Jm	����cd�?]�gٵ��?��;Wuۄ'��1�0/�$�ߥW��n.��Kt{Y�'>�>Jfo��y������",�zNL���S�<^�0���G�{���G�-�E�����c-4��'?���L9(�2XD<ȸ 95|NRk�JQ��KG0�Ȑg����Q˅�7N7k"һ��]r��y�6    �+`�`,8QI�=1�v��A��5+��[�U &��r�_�n����C��zˮ~م|#�-z�s�����Z��BMk@T���;:�[
5Y���/m����EO�k��\�M	��CO��D���F$��Y"*U��t����mS�:��]��K��P�Z�iӉ6��E�B���I�D����1�  �I}3�G%�d�G�ǣ4�';�$�BwJ0���f!Ԓv!M�1%꧴8Zd�;#J��DI�A����>���n���k�L��jw�z_��'��>!ӸZ���DcOV*+�9���W�|�+o�R��y(�V��>��o����쇞�Rq�/��2���I@����X�,�7�]hC�L��������s���q��y
�q/ ,tμ.&��
��v�:�*]�D<�9��3���u(F�v>�	�y���I����!n��Kɩ����º��#�
����a�	Fo���RO4m�)���<�^$�����e���U{]{tfE/�ݥ�3����Up6���\�t��{^��
���W7\(�����Ӻ���W�@dɇ��z��=t����%@��܈�`t��L�Wc���1��q�Lߜ�;9�Mh毪�2Y�J?/�8�j����;UOU�K�V�������7�4*�H���u�X����<�K!�B#k�/��,0������q�f��fȥ|i9�8q�v1���K�vF%f,�gF�f�g��AI�>7AfwX�zȗ��MNE��P�Cv�>>�灉�3�����s��ɠع��)`�^(^���R�/��.��l�E� <��ed�|3�G	��W�ģq�����\nq�oRv%��\����4�����4����೮�1=�{�������b<;�qI��t&����#:"��PU��\�l�G(W�OHn�����N�vM4��6�>]o�7����Iس��}05Lj�K����e�W����VJ�U���7��67$b�Eݕ��N5��!�>�Z��'��@�tb��&m�3�E�����|��/�(>��.���������jh~�l-��r��8L�n�Y�|�Gv84s�;9AըS��S�f�,�����[(Zg��ϥ�9��3#לzRM���Z�0d��m2��y.���l5�̟��`���inxN�nay�(�I_���}[��I�PE��3�gj�ɼ:�2�pT�|��(��w��o;1E�4�lp��0��CvZ2�q�81(B���D�t�^
/ �J�V��Ҋ�tE{�ъ)�?p���
�!��a"��& �]
�]Ż�B�\'��w�K�`�2�B��z}���'U�c�ܮ7Xh?�Dþ����8���i+a_��+��|��1��9��������p�����C1���T�~و �bB0W���k	�r�;.��_
�h�^Y/!��f2{���,�Z��_�~/Ƥ���C���/��n���M:��O�Z�-�5���oɮ���%4z���͊�� /1�\�ɳ�, �4��{����z����R����/R�c��Md�RF�q�+��_�+�s&�;���,�k�ݡ��/��k����VB&�>&%�G��lvH�Cӕ�`���c�Mk�Xb(��
�'"L�c�W�H�?�%}�]/k� G�����z�c��a`̻���g@�d.CӺL: .��-��lɴ���U��ĩ ����� �P���1.��rU0���*Ya�Q�Ӻ���G��ױ��LDQf�a[����(�$�nn��r�qY���eI�L��|��E5�a\��K��~ ���:�M�qa�tx���� �\�#ΞS�ô�+���82Ghp��;�4���%��!��`sf��`�����aY�Vb�eəϖ2�+^w��\jYtc�81"�k|���Ⱦ�<�6��O�ܪX|?ߟjߧ��>A�;0���#��!#�CI���2�q(����/l��ńĒ}8 �3��������,_�[�%h����1P���~���Щ�Ɓ���nx�g�Ǘ��2!lL��ku�C�a���ohi*Rji|>��f}y�ۆ�_f�8�W4����U���\A��[����y��:�6lڄc���e���\��B~	��,�\Iex�$�m:u���/���@m�h�`�ţ)iWt*:"�0����SzQF思gK�%�E�Q����T��<iY�{0D��Ԓʃ�E�f=o&�i��q4�: F��qO�LK̴D!ԓs~Կ>#?�	�F��7�ZY���_��� ](���3>[��f�[�$����ӱ>[5.��e,A���}��Vպ���n��q���d/
\�g]tiY���� �M��4u����@��) �p��v���XM�N��78)�����A�����.:�o���k��i��E+�q���� C@����>0�:5Fo�zE�]�����u�p���GCB����}�.�(yQ���c>� ��x5ͻ.�Z/Ofǐ�Vvάos�`�+�U���;0s1�{�� ���8Nt�q��(�_���~�y�h� �$q{��F���}zP��r�⚱<~������|�����/�7)�[�t�S� I�[�㙉lBq<B>a	����#d"��S�!&~	���Z�)J�"Z�V>)���c<4�_4:�@���4`;f/����Kd��q��hG)���&e�2+,Q�Հ�lJZyCkѿ�U��m��K��UT�&�5H����)���`M����T#� ��d�'��=�t��,Z���gI_�Ie������c�u�r��
(n�f�� ��APt�� �S�cFB%*�s�Lf G�i�U�gr���b;f"�o�@����X��H#=� ��+��Y��4y�uô��@���{X�qy(tL-GVU��h��|o� �n��Q`�\�H��7��Ѭ O�@0L��q��B`U��]RģC��b�˼��Bz���f0(3��@����X��4�VV$ 6�1�*9�C��K���s��;H`��@��DO ��@���<ܰǬCn��D}���\1�a�f��اd0�D^9]Lh������r#:�gfodR*�dJ3�i�9U���f���g�V�I��R(�њ�[��&)7�q �Q�J{��0*�B��]ҥ�D���s�����Κ t�x���V�~�$0��+�]�?���<�I�/Yn�Od�K!D��~��{�/�U-gYW�����R��<�fq�JO�
 W���D5�!��>�QU������Xa^`�|+�� �^b�7� x�i��Qʜ4-�R��h"�1 �I�n��M�;���[<��W>n�p7R��F҂72#Ǎ�x�ȹm�q#�ͦ�	LR?�@K�:����J����W��N���Eǔtٶ��T:���+���1G�#��`��Ae�x�t�=�b���#�l��uF�	�9G#g��?��q:�����f��7x:�@m�!(��M��$A|���ą9c��OH��ۺ�f
���|����x4��7��fD�kRf��H��b`XLI��>j�����SF+�ƙ�ZS�Ff�jH�Pө>��9�<JlZ��BeӉ>��=��t}DA��GiU�؉�0�T�����8��N���j�5F���bH��1�(%
�+J�8�G@�g�xC-z:�n!ײ���t�3��na��g�[d�+r��(Z�V����LV�O��p�¨�C����&U��T�U� ��/1�	 ,2*��˳n#n��W:�m��H,�Y�rS	>h�;68��^��5]b��i�ٕ�8�:$|m�ơ�'��l|�]�������%-	p��kQ��q�H!��t�q�@z�����`�I�!6G5��m��(s�4��u�qBl.  2���2䛵1䁀ؽ��Fn��+#��������v�E��aM�g{�X���>ĺ���k/�ib���o|�x��+���)TO�R��ʉ\�ŗU L�Rс0	6R&���� +   )@��FT��K�����2�Lm��6B��~�����f�-D      �      x������ � �      �   2  x���=o�0Eg�WdlU%�c&��ԡB�,�0.lp����)m�VЩ㻾��甇����1�o�A��0Vy�&��Le;�\�T}��X��� �1I��`��~m�1���5�u��ݩ�M�`�c!8E�%9TL��x�a�H�!�@<�4E�_ϱ���@y(���Pۗ��zg���K�x�!#����5�Z(?~{�4[�g��� �^DcW���G���d�Θ>�|`R���~ ���|L����9M��}WT�� 'È~�q�OOY�Ov���\��/n$'8pCr5�B����N�(z�)��      �   6  x�햻n�0�g�)8u�@Q�n[Ըh��$͔��(��L٤�H	�.A�v�C��J��K�t0�� R琇���D'I?�!�y���J�J���c�DxF{(����|��o�@��Q#ZV�D:A�:�t���ul5��l�Ӆ��h�y|(�����O�8�%xm�N��<2��ڞ
V�"�7&ct$�Yg2�ա�>k�[g_3
j�IJ2�u͔C ��f�d'Yv8���1���ع`¨0�T������k�[3t.�N��ϖ)@YpR�	-�B�	�Lh%S�N1A�Z&	�`m���5J
ӽ�����I����%�&�~Y�9;�<��:���3�G�?�v��IŜ�n���h�R�ظTX��+uސ���������;����:��Q�I>+�ݎ�ڥo]*�KR��1�Yڧ߲�����@<�����I�n���ǔ�DVˀ����v�_�Q���������;��Q���G����m�	�:��K���I?h:t۠��5�������|��*틾���6(')�\���U��!T6,h7�L��xG��+w4�d*�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   e  x����K�0���_�Eoi�Ҥi�AxP������n�ҵY����2�$���x��h&T�5�1�GW��(ɣ��������S$O��}��M�^U��(L�D�0G��`X`��4J���*/'�\ٌM6����'n��d֛'ìו ��QB�/��֝Q�7}�t&q޻�ȶ��o��*]˃i�re '��mS���P[���[��HN��C���ˀ�c�U�d�7F��.���ޗV 3D"b9GTK����)Vj�i|��0�c��-�aw����bAh��e�o.��?�F��d�,���
����L ��#P�����D�L[�8P�h�RTR��k���$��/:e�       �     x����n�8E��W��P$�Aj��0�YLcv��Kr��ӎ�맔m�цC�,�W�W������A���i[}x�^]�Xm����S��}8@�I�W��M@��2!p+QC�9�ڭW����ʣg@�_|	� C`�P�L�̴��owO���a����ϟ\�̴�����2C�xî�'� �N9z��Hc��@�9��b/�?N��{�?�s�5F���{��<ow�gwL�=E��v��u�Հ[�8	Ôj�\���W�X� �H����Vg7�����o����^�6�lm^����!��θD��� �8 ���Z8���b���{�AGG�:y�3��\^y�\ڄ.�;�[�k�G�-��}%�(�`q�'K�XB����w�nt8�����A��M��m o�/��yU]PoN!����PE��)����'���/���.�z�P?7�)_�#w�ߔ��N��t���d�FA���H�6S��ωӀ�?��'�&�n!���k�>!�����E��d���D�:�j�f��G62?:6��V'�-~B��Y����~Ἧ.���_���ر��e�y}�e��GۈN���h�3U�P'^�] �.����T��e�]㓝���MT���6~w}�l]�⹭7����✢@i�B�v'b&�P�`����J���N�RS��z=h%����}�/�w7n�<?�b���~~d,��w�v{���V�j�7��y^�E���Lj���sZ�B=��;�yd�O;��H:���}������X      �   x   x�K�M15��/N1000,�Ȳ�03-�2�-�L�M.��JO2��$��g�Y�eq��F�r::�x��r����J�4202�50�54U02�2��20�324D��)XYZ�Y�p��qqq �L!b      �      x������ � �      �     x���Is����Y�ږH�$V��<��6��)Sh�~�KQ��ڢ��	��ŹùFd��I��w�B�����IdpOjL� GA��t"셜A#�ݿ����=ڲ�5_�w��$i?��I~Єfi�Nj@w��:�B�e骯���|11�p��p�A<��zoϻ�L�	��2�� �~���A~�� 	�
���]zC�$ȉ��~��k8>-.�oFd$u�¬2�@1,B������Mi�o<�}���Q�<n˃�<��98(�u[���l�Nbc�@qzS��Az#�� C3�8�ifE`�m:�&��y�o(���2����A�wИ|!!�!�[�Y��%� J�O]L>��Ű�IJ��3��lxm�}k��d��_�z8�Z��F�mz�ʂx:�e+vO�?Z#��� ���s����Fw����-��x�C�C��{�l�4'&��3���#��i/ydM|�y���t³G���.����+{�ҭ����4'�y�������#����l_�<���
_Ph�*M-��C�?
>5%u���>�(�QI��Z/G�'&�8	O�(���&��z����̔�h��f|�����_޴�g֟@��������LW�1?MCc�0���F"���°��'�(�̓�� Dƭ���.	������N̦���	�����U���eU���+�87=
���0�2�0|'K��>��,�W:��t��8N��Z�E�a�|l�W�,�{d�?vi��H��w����x9�r�[1ug��vOM�z�~E�@��U^	�H$��ɐ�����Ɓ 2Ϧ�F�����(�B뷹�E�L9��i�$��rhm��@���n�|C�i�~o�^5K�aNL�0kůYDu  NT�/X�N�b1��eQp���5ŧiP#�ٙ^y���SxڙW���
[l��G麩<w�����2T��D���a3z��=����"�l�I����s��S�E��4���SJ+�F�%�5��כB��f�?�i��B�dZ���3mG�&ފ��|(;��V�����a��`гƘ/��Et*fKӲؙ���胈�p���9'�ꎮ�>�$�-iLGb��ѦWgܣd�'���5�Uzp1�CS�@;Z/g`�*���_��DB*�^/V�f� �}��2a,������"fN���KƇ��-z:C�,�WѪtM� bǅ��p�S1�qS������rhcD�`��)l�p2zԽs*ʗ���s��6��<'4���E������]�v/_��c߄��m�ݢ|��GG:�n����QW�^Ub͝9�ph�k��_3!Vx*ǣWP]��(jW1���,x[V%F�x�K1[|V�"��	|�3�a�����0N�CQ�Y������ ��W��f��祝��I�����4�͇��my���um�x�g���kD6�$�/;E)n��Bm)
U\�< ��XI��mt���-��a���z]4��[�õY��a��G�mV����#9�a0���g���E��[�������$�	����a,A˼�ć|�����j1g��gDI[a�Yɏ{�[������{��8�^�Pg���<#��O�U�G�2۵�p�y�PtL��}�_P!~���E����aa"X�0`���X�NPz0Y��(c�<�~��.��Ł��븼'=���v1��I�d,�Fxy���͝�FY��|Ȯ�����>�l���i�u���[�V��^DHz�]�i�D���@q�e�IY)y�L�I��>;zk<��N����\Z\�=�
_Ԥe�5n}3����x�l?
	�'�@fc�)	fL���[|{.)������)ȁ\e(y�jN<Zi�a��6Nں�zw+�������z�vxj="z�vЕ��:��=���/��f�W�}(kǛ�1��G0�%��ŋ�$�S��H����zﳶ���5�N@��������k�W넿��8[/	�)�W���
�jr�{�U��Ss���0٬$?o"0~*�M19'�i1\��nU�y���u��R{�vd��p߾}�/n��p     