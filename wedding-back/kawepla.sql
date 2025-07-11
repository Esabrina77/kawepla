PGDMP  &             	        }           wedding_invitations    17.5    17.5 >    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16542    wedding_invitations    DATABASE     �   CREATE DATABASE wedding_invitations WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'French_France.1252';
 #   DROP DATABASE wedding_invitations;
                     weduser    false                        2615    45756    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     weduser    false            �           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        weduser    false    5            �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        weduser    false    5            {           1247    48942    ConversationStatus    TYPE     `   CREATE TYPE public."ConversationStatus" AS ENUM (
    'ACTIVE',
    'ARCHIVED',
    'CLOSED'
);
 '   DROP TYPE public."ConversationStatus";
       public               weduser    false    5            c           1247    45794    InvitationStatus    TYPE     `   CREATE TYPE public."InvitationStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);
 %   DROP TYPE public."InvitationStatus";
       public               weduser    false    5            ~           1247    48950    MessageType    TYPE     `   CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE',
    'SYSTEM'
);
     DROP TYPE public."MessageType";
       public               weduser    false    5            `           1247    45786 
   RSVPStatus    TYPE     \   CREATE TYPE public."RSVPStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'DECLINED'
);
    DROP TYPE public."RSVPStatus";
       public               weduser    false    5            ]           1247    45778    SubscriptionTier    TYPE     ^   CREATE TYPE public."SubscriptionTier" AS ENUM (
    'BASIC',
    'STANDARD',
    'PREMIUM'
);
 %   DROP TYPE public."SubscriptionTier";
       public               weduser    false    5            Z           1247    45770    UserRole    TYPE     R   CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'COUPLE',
    'GUEST'
);
    DROP TYPE public."UserRole";
       public               weduser    false    5            �            1259    45757    _prisma_migrations    TABLE     �  CREATE TABLE public._prisma_migrations (
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
       public         heap r       weduser    false    5            �            1259    48960    conversations    TABLE     �  CREATE TABLE public.conversations (
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
       public         heap r       weduser    false    891    891    5            �            1259    45821    designs    TABLE     �  CREATE TABLE public.designs (
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
       public         heap r       weduser    false    5            �            1259    47555    email_verifications    TABLE     ,  CREATE TABLE public.email_verifications (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 '   DROP TABLE public.email_verifications;
       public         heap r       weduser    false    5            �            1259    45843    guests    TABLE     s  CREATE TABLE public.guests (
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
    "invitationSentAt" timestamp(3) without time zone
);
    DROP TABLE public.guests;
       public         heap r       weduser    false    5            �            1259    45833    invitations    TABLE     V  CREATE TABLE public.invitations (
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
    "welcomeMessage" text DEFAULT 'Bienvenue à notre mariage'::text
);
    DROP TABLE public.invitations;
       public         heap r       weduser    false    867    5    867            �            1259    48970    messages    TABLE     �  CREATE TABLE public.messages (
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
       public         heap r       weduser    false    894    5    894            �            1259    45813    refresh_tokens    TABLE     �   CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 "   DROP TABLE public.refresh_tokens;
       public         heap r       weduser    false    5            �            1259    45853    rsvps    TABLE     3  CREATE TABLE public.rsvps (
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
    "guestId" text NOT NULL
);
    DROP TABLE public.rsvps;
       public         heap r       weduser    false    864    864    5            �            1259    45801    users    TABLE     }  CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" DEFAULT 'COUPLE'::public."UserRole" NOT NULL,
    "subscriptionTier" public."SubscriptionTier" DEFAULT 'BASIC'::public."SubscriptionTier" NOT NULL,
    "subscriptionEndDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
    DROP TABLE public.users;
       public         heap r       weduser    false    858    861    858    861    5            �          0    45757    _prisma_migrations 
   TABLE DATA           �   COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
    public               weduser    false    217   �`       �          0    48960    conversations 
   TABLE DATA           �   COPY public.conversations (id, "userId", "invitationId", "adminId", status, "lastMessageAt", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    225   �d       �          0    45821    designs 
   TABLE DATA             COPY public.designs (id, name, description, category, tags, "isActive", "isPremium", price, "createdBy", "createdAt", "updatedAt", template, styles, components, variables, version, "customFonts", "backgroundImage", "backgroundImageRequired", "previewImages") FROM stdin;
    public               weduser    false    220   ?e       �          0    47555    email_verifications 
   TABLE DATA           b   COPY public.email_verifications (id, email, code, "expiresAt", verified, "createdAt") FROM stdin;
    public               weduser    false    224   �       �          0    45843    guests 
   TABLE DATA           �   COPY public.guests (id, "firstName", "lastName", email, phone, "isVIP", "dietaryRestrictions", "plusOne", "plusOneName", "inviteToken", "usedAt", "createdAt", "updatedAt", "userId", "invitationId", "invitationSentAt") FROM stdin;
    public               weduser    false    222   ��       �          0    45833    invitations 
   TABLE DATA           �  COPY public.invitations (id, title, description, "weddingDate", "ceremonyTime", "receptionTime", "venueName", "venueAddress", "venueCoordinates", "customDomain", status, photos, program, restrictions, languages, "maxGuests", "createdAt", "updatedAt", "userId", "designId", "blessingText", contact, "coupleName", "dressCode", "invitationText", message, "moreInfo", "rsvpDate", "rsvpDetails", "rsvpForm", "welcomeMessage") FROM stdin;
    public               weduser    false    221   �       �          0    48970    messages 
   TABLE DATA           �   COPY public.messages (id, "conversationId", "senderId", content, "messageType", "isRead", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    226   ф       �          0    45813    refresh_tokens 
   TABLE DATA           W   COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
    public               weduser    false    219   ߅       �          0    45853    rsvps 
   TABLE DATA           �   COPY public.rsvps (id, status, message, "attendingCeremony", "attendingReception", "numberOfGuests", "respondedAt", "createdAt", "updatedAt", "invitationId", "guestId") FROM stdin;
    public               weduser    false    223   ��       �          0    45801    users 
   TABLE DATA           �   COPY public.users (id, email, password, "firstName", "lastName", role, "subscriptionTier", "subscriptionEndDate", "isActive", "emailVerified", "createdAt", "updatedAt") FROM stdin;
    public               weduser    false    218   ��       �           2606    45765 *   _prisma_migrations _prisma_migrations_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
       public                 weduser    false    217            �           2606    48969     conversations conversations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_pkey;
       public                 weduser    false    225            �           2606    45832    designs designs_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.designs DROP CONSTRAINT designs_pkey;
       public                 weduser    false    220            �           2606    47563 ,   email_verifications email_verifications_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.email_verifications DROP CONSTRAINT email_verifications_pkey;
       public                 weduser    false    224            �           2606    45852    guests guests_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.guests DROP CONSTRAINT guests_pkey;
       public                 weduser    false    222            �           2606    45842    invitations invitations_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.invitations DROP CONSTRAINT invitations_pkey;
       public                 weduser    false    221            �           2606    48979    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 weduser    false    226            �           2606    45820 "   refresh_tokens refresh_tokens_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
       public                 weduser    false    219            �           2606    45864    rsvps rsvps_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT rsvps_pkey;
       public                 weduser    false    223            �           2606    45812    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 weduser    false    218            �           1259    48596    guests_invitationId_email_key    INDEX     j   CREATE UNIQUE INDEX "guests_invitationId_email_key" ON public.guests USING btree ("invitationId", email);
 3   DROP INDEX public."guests_invitationId_email_key";
       public                 weduser    false    222    222            �           1259    45879    guests_inviteToken_key    INDEX     [   CREATE UNIQUE INDEX "guests_inviteToken_key" ON public.guests USING btree ("inviteToken");
 ,   DROP INDEX public."guests_inviteToken_key";
       public                 weduser    false    222            �           1259    45878    invitations_customDomain_key    INDEX     g   CREATE UNIQUE INDEX "invitations_customDomain_key" ON public.invitations USING btree ("customDomain");
 2   DROP INDEX public."invitations_customDomain_key";
       public                 weduser    false    221            �           1259    45877    refresh_tokens_token_key    INDEX     [   CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);
 ,   DROP INDEX public.refresh_tokens_token_key;
       public                 weduser    false    219            �           1259    45880    rsvps_guestId_key    INDEX     Q   CREATE UNIQUE INDEX "rsvps_guestId_key" ON public.rsvps USING btree ("guestId");
 '   DROP INDEX public."rsvps_guestId_key";
       public                 weduser    false    223            �           1259    45876    users_email_key    INDEX     I   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
 #   DROP INDEX public.users_email_key;
       public                 weduser    false    218                       2606    49000 (   conversations conversations_adminId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_adminId_fkey";
       public               weduser    false    225    218    4839                       2606    48995 -   conversations conversations_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_invitationId_fkey";
       public               weduser    false    4847    221    225                       2606    48990 '   conversations conversations_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.conversations DROP CONSTRAINT "conversations_userId_fkey";
       public               weduser    false    4839    218    225            �           2606    45886    designs designs_createdBy_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.designs
    ADD CONSTRAINT "designs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.designs DROP CONSTRAINT "designs_createdBy_fkey";
       public               weduser    false    220    218    4839                       2606    45906    guests guests_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.guests DROP CONSTRAINT "guests_invitationId_fkey";
       public               weduser    false    221    222    4847                       2606    45901    guests guests_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.guests DROP CONSTRAINT "guests_userId_fkey";
       public               weduser    false    222    218    4839            �           2606    45896 %   invitations invitations_designId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_designId_fkey" FOREIGN KEY ("designId") REFERENCES public.designs(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.invitations DROP CONSTRAINT "invitations_designId_fkey";
       public               weduser    false    221    4844    220                        2606    45891 #   invitations invitations_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.invitations DROP CONSTRAINT "invitations_userId_fkey";
       public               weduser    false    221    4839    218                       2606    49005 %   messages messages_conversationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.messages DROP CONSTRAINT "messages_conversationId_fkey";
       public               weduser    false    225    226    4858            	           2606    49010    messages messages_senderId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.messages DROP CONSTRAINT "messages_senderId_fkey";
       public               weduser    false    226    218    4839            �           2606    45881 )   refresh_tokens refresh_tokens_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.refresh_tokens DROP CONSTRAINT "refresh_tokens_userId_fkey";
       public               weduser    false    4839    219    218                       2606    45916    rsvps rsvps_guestId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT "rsvps_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT "rsvps_guestId_fkey";
       public               weduser    false    223    222    4851                       2606    45911    rsvps rsvps_invitationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT "rsvps_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES public.invitations(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.rsvps DROP CONSTRAINT "rsvps_invitationId_fkey";
       public               weduser    false    223    4847    221            �   �  x�m�kn[9�;�����DJw���Ta I;���:I[;�qm\�J��t�cYSZ%L4Q���T�{����9[�u.��C�ZcT�Pq������F��Lo�(�����`cG@9�%�{���ao�E�?@/O�@�$3�O���˿��}��X.���r��|$�ՓX,- ��U+���uV/j�E'�L֤K�M� #��^p��m��]'Y����6����b�z��B�����㹝�ߞg����~XG���\��_��;VIf�I
y*mp� ��\m�|N�V�.*�L��/��#�Gu@�q��T<�γg�u� ��Z��`��������v|8��|�T��J�ݛ�Ji8�$�1Şl
�ռ���jMӠg�M7`��-C�&�T�+t��0��Ŋ�A��ˎ�Nن�'���&��7ͩ=��cΧ8�A�o�Ȭn��4Ubb��S�fO�w`��^a��s��C]�r�ŃW�h KYէ�R˚P�����A��Ƽ�flx�M���s�����q�K�}��[I�_yb
�W�c�f˖So4�z[��K�q��X��׈�`�EK4!��q@V��2�����ȅh����aބ�9�|�S1����?��C&\W����㣭8Şb�=	9�RgI�����w�W���y���Ъs������u���%:ZZS�d�O��K�oY��K�+W<%r%�������f�w�q�캤DF�͑�H���dm�$�3Պ���z����+a�G43L��R$*�7'�ʐ��\����&��� ��V|�y�S���f5�c����O������p�u�����R��#�Q�l�&�[�N-��e�4'�I�C�N���s��5�BH��":@�V�'i��pAUc�T"��ܨ��t_C���0�ߡО�ï�q|���p9�W�/��������      �   �   x�uʱ� ����(9.l�8�8�N�X���ԧ�n.����>>�� (��̣o4;�8-���VѹD���~�v�*��i|uv�N�G�ݝ�@@��U�ԁ0�W��o��	�)�̟�d����0*U      �      x��]ێ�6z�?�І��H�F�*��k`�^;	��Ycm`nTU�n٪RYR���r ���\d?���O�3EUw�7�g\�(�'��?���nݗ7��}�����]�I�}�<�C]v]��_5�e���UW��EAy�A�����.�4�/?w���?4Wmy��@P��؁ ��n,vh��:�������(��h	����8}�d�"���ߜ��}s��^gn��`�h���-�l��UX�o���f�\��>�%���Go�A���7��ڿ}�m�^}�V���,8������ߜ�2��u��qk�k�7�����G"-���}�m����Ѹ�!��D���!�����0ce����XxU�G����o�����[��-����;X���D��w>'7�+C�;���A��� ܀������h���0PG
��M���/VR) ���ߛ���n�]n�p'i�ᆵmH[�
�5d�m�F�i�?�����)]5}��9�������3��0A�e1��7	���L�&�<�/��em"��n!]=�yw(��#փ�~���}�=��'��������\���6펖���۔=`��
��������_o����uϸ�^(Ƽ��"_��6D2��-�j8���Ԙ��b"e� ��A��c�6�p���:qlP0mH���d�b��cP�\�|����� �����c�u�
୊/�ڦ*�@�@�����|�Ϸusl���￙
�*P:��e�My�6��b�_��߃�դ�*����B��g�L�6�t�߾}��� ����B��U��8�wA���&��r��Q廲����,
�c��K\~v$H�9��JJj��@��}�+�������k]  ����� ��j_���}�V����ȣ���*��_��q�A����m͓MI~��\͂����z[��w�ͷQ���"�Ơr�$+�K�l�bs�Q��n����r�ܒ�'��`��j�V��h������,���Or�0��Y/�Y��?�<�e�}��(�a���Oٟh^�fѬ�pĮ�����&+��u"�D�V��*�E��b�>��@g�0���۪&:�lU��1|~����q^�,�L����GU�4�p���pExw�D�q�>?G7�C���{\`��|T� c	G�sl���pՕ/�X��n���nW�>�?�c����k(����/noo��i�^$�(F�����7w�`��&��\�`��e^�����ڠ2��C/�WЯ��fVt���k���_Ӫ����)�ft�
������6�U���h�k��[�{���?�/8e5�� Iɬ��t 1=sT���:������_�|���1�@�ы]�6��>r;��Xk&�I;/h����TaH��4��m2��J8G�_8y��T���� �=�7{`g��������]<<,�AZ&��4���B�zV���66���USo���ǶvY閊Td�=H��3��D:�ŗ�LT&"���V��^�ǲn����{S�l�_	T?&��^�.k�<F��F�"�����޽@JM
�l>����Qcl;��^3d+�<����6�ƈ�0�4B��F�D�͠�)f�"�|�u��FH� $��`C�9�ofD��n��cO��i*�U鋋P�<��p�ԚFK$T�yPi�tA��Ђzu]�vT�[s���H]�N.�#�槷2T��n�K��a@��'x8ixad���~^�u�%�5��V�,�?b�`mb+Kl�/��}&��3�bOaҘ��6h�ZY	��L���Bh|�.O�(r��1�~�����j�뤬�%|�!������fm����>���w���T%fq�ܭ��G�t��F0��̖Lk�6j�	
�~q�;�"1�T��eZL�^ql�xP!�'��!Q0�9��+2S�g�м��;&2�}:6��	\C�0��i]���Nي���"���JtU�̈qu����dU��Hc$�]����%��;���g���0ڹ�Q���U,�!�K^ň=�akʂ�Ϸ��<b�lAD����Ө�V}�;@��x"�\��9�c`�۫K/��W�b_ɴؗ�E������&X`ʥz��@�!�W"N��hʇ@��!��f���ٴg8����t���e͇�D`t;�-c��
�9i�m[T���nfLTfL(67���|v]m�?���)\���g���"��\�����J�*8���#�?��w����H!:�f7·F����6T�#�B1JG�Veu!��(�1�81�Hh�k��3FZM�>u��N��p�*W�H�SJ�Dn��X~�A��j=������.B(��P��e`��I�e���A:�B���i7��8=�fr���U��U�8g	�ȄL��ѡ7�I�{�Y:dm�EB�f����ζĽwT�(gN���["S�~}��i�d�Bٖ����H�jk���!�"äq������s/�0(�5��|t0�I�l�s��m�C@ڑ0��J1�Y�)��L��a����.j�f���w���qH#_���Z�s�E�[�R9�MG� 1��U�WI������2��3�u���컭�����Xk�pxv�Sw�Dw��^�hk+�B�-2�X7J��)�5�x���;v}���5Ki�]�,^�Y29V���d]_5�5��L"�w�v�9'f�g\1b`U>'iS{�|�%=�~��}���N]V��AZ�~N�&>sf����bC��_���\��z��<��mo(�:xRxŨ�����Y�
��!0Yio����o��}��gZJV՜F��֯Z��|�a���A"�������Z}R{\X�_�
��c`U7��5Z��Vo:��翟I"�ΰ�I��C���3�O�%"��z�DiS��WK�ن�������2��XuV�����1e���$W��
���{}d#^�,�c���Þ��qw��=Y�&��YSU�Ɠ�Ba_�5XO�3=Wr0Mf�d2,�g��FL)-�UU�ZZ�8���&!R��0;yJZQ���<��{1�T!�+a��`�6�,˩�C�A��?i���+Sb¬�߉]�E�N��AY�(�U������O�dӃؚ���2
�˕�Ġ}��s/w�f���br�8V�p�f�����4�CF$����6�'��v�>@��j{E���I�rè��e�y�����:%:�����o3l��<��=��>��ޭ��<��'G�Ҧ�⦿/��^U;(2�_����g$.�}�6��UGAW�������c��)�}pS���=\��n�-`ț$��~��˗��e�͗Yj�?��!4��ݝ��=�$�b:�d>�ď�<�q��ڡ56�x�c�:�Ă�C�o6�S6�p���ӓ�A�O���B��?��q�ygv<��`ZN:p3�<����?�|��|��2L�J�4�Z�.��5�f��x��y��X�?�)��mi?��ܛW<���@�P��T�֐�cH�v&X�w2�,��];�ھ����� �����b]l��P~��E�ur��9�)�#[TUw$m�H��H�ï��6؏��j�a�1�t!z�bDD�W�]g|��R^�=�AI����	����V��6�|�x����qأ�P�u�`>��ice�2mO��=�~����ڴd���70��4��W����3��5�_��8�mO�ʙi��c���t�����PG�ZnH�.�xd9�n�MJ:���1+�V�-�C�M*����!`�o%t��w2���B�Vm����$�n�:�nؒ�un����	��?V���K�"k�ʌU��ա���)�P�@O�]���a\*�t8���3)��WĘ� BQj���8�H��Һ�9J˖(N���	$��\}׵��wE��f����)�Bgx�qtp$� �lQ���,�BEr��q:��u���Tk��!�e/_���8�Gi��t2x��/�ٔ��{b*�w�!��r��� )8X^�p�)q�A\��š����9��-Xd�y����`6QW!�� �
   ��9�򦪭�&j�����ǃO��֐�Z�������o(Yn�&M�A�A� D�͆�f�'&�X��bM����y#���ȵF���5a�:�as��1l: �m�&Z��J�Ǎ�A���_v=��� ��K��C�����	��� 3��O��U��L	��iE�xۂ�G��P7���F��ӘY��'F��i�B��v�Bڜ�5��e͈���'1��H�cա��H��`�ۜF/�s���9X�"XPL��%��qF�@c���"Be$��t�Q-%�$6@��I�8�Xe��l�ƛT���ʼ�����S��	լ|-]^�_�w��S���������D�`�W�P�%�+��'�;�]�4R�a7��C���Ɛ(�O�����ydb�0E��Q��L���|a��p!8E��S��Z|?�?��B�,"ӈY��=m��p��L��@r�"NR����Bi�H̨��hġ�c�D�wD����D�=�=
��4�);��,y<� ��6 ٯ������eN��G�cd}O�Q0e
����@�}��g���G2�����5�w�����l��.�\��C�MY5fȘ�Z����qP��'���ʨA&����k0����>��#�B1{u�q9�cx)g�C�ͤ��q�Q �K�(���bC�i:C�`���������b��,Tqİpyo���z������JDa��-u��p�^,��Ao�ޗ�Зll�c��8����7�1H��;��x�[�3'j9�f,����#��x�ތH\\��f6�:QV'�La�H$gL��h3��4��O�/2�� 龣�����j��g_�fM��S�L{̓&Z5���?m֘�VѪ���]Y�����3
ᙍyl��Ql�Q�=n��݂�[ ~��9���b�Ǘ +��Ycu%����[Y����j�۹�$:�o��+�kO1�D�g�������8�K�X87��33���e�*E"�����C��i��k7�+�'G�Y�[$+�J>/����RT��\��a6��$��6�&�=|mF���Ke_:�1��|H}�
��1�q�~�.�_���p�{(Y�>Ȳ" �~}E� ���x\����]�	��Ɩ�3�E��/~�6��+�Щ�I7����ϼ	uJ���*h�tE�^�ѓ�K"'� z�6�Īkp;����X[O��&*b���H��5֣Si�(H«%Dvbuw�l�����ߢ̕N� p�t(q��;}�O^ͺ�� ��_� �$9�A3��1����8���6 �l���w&�L>�C�҇'���<=:8���5M��c�?N��XIiɪ_��;�L�r��r�Tx%O��b_
�##���8����v9��U"�G2�.dN�(|�t�D�W2���A�80F�0A &>Р�U��׼.\Ɉ8�AX�8`���Df.A`I`ݳX�#��C�x��-�^����l��#+n&�1z�.<� ��r{�����8EB��R��(���<X��w���A��G��xv���DL"@���° �҇����CR�-)BIFFm`R�Z핧-8 ������4��ɻ|��L;z�Ij:�	1�:t.�y����' ���.�ɢj��T(8��*�o�[� Z���Ig���:t`Psf�ct�����լ��A@�x,&�j1`����ێ���3a,Μj
�����J�b)�W2/�jR��Rʭ���TM&V��-��$�L�%��Q���V��p.>@�D$�R�L*�xS�����).���XJV0%���J�:3�1�x�%�?�28��r��ON���<�K�NY��O6���]F�#�]�mU��0�\js�9A�q���vM3�	S��ĳֲ�/�D<��ߚ����L56'U�N5v;3?�c��>�;��qA�cN�I�R�4��8�	��|��L	G먏�^K3�
z�� H5�&��˗p�A��O�~/�Y�I��*��>M.&�'�O��|���P#쇖�nr�,�뗆*�H��8����{0r6Ceu gs�E�m� ].Ò2����v��
Gn���d�F����"��c:"����s��>t����'S��1��sj���H�6����*R�g �h�8%	��x#xߪ��q���v��8I���]2�=��Z����#�?�@�4'�2����H&��9��8��-��*O(��}2��Fj��ڐӅڋ�ً,�mV��B.��X�F��
}�ᇠ��G�U����O$���>3����C�6�P�4?]}v���b�1��~�PH~�]b�l�mr!l��Rbd[rȟv�9�B�<����2��C��9$�>� �0x�n�C?�Ƕw����	�LV�oz�;Ղ���p�f�K5��w:.��, +�X7'2�C��?�˳.#��WQlOLID��<�+L���\��&���*K�{�A��`W:�J8���Xп��O-&;W��`#Y鄬�!�%L��Ch�I1|V�)?�����ѥKT�Ɛ^���S?dPk�l�-P�4e7>�'n�Hc2�����y��0 ��p}6����@>�c"���PskR���'��������E�S2�H�� �2����wr�`n���8�w�Ήe0���:���=�=fz�0��|g���mB(�-�_��E�b�OB�̆-'�rH6}�/�(�3Q06 L��aB�|=���kƁr      �   �   x�u�M
�0��ur
/`���L��qe(Qh����=��Xf�2<_*��-# `m���זV��6$6����]�t+�8A@v�o�!��h�'���h?E�ԝ3ӿ�j��ΗI����千.BP�m�>�H�����61      �   f  x����J�0���S�-��m�RЍ���ٴi'�6��g��7�9��Lgep@�E����pϗh�GӍs�1��T2+l�S�!�U����z�z�}�R^��m��EX�RpF	�]�ztZ��=�A��% �w���HY�G0�1�1N/ 2�3. qR�8�4E����w��aB&�zl^��4KgX�C��;�m؆�3^�>����_���
0�=�EW�ݴ~t�Q,T�{J��B2U!�����߇��+(�-���yp����"���4���i<@~���9��	$*=�ySk��V��I%���V�C��wj���~���@V �Ri�i���_Y�fy'�g�����VIE��;      �   �  x���Mr�0���o�$�0��:�iq[2�P��F���%�����L'���覇�&9A��g��g�4�lI�I��S�E�U�p�5S��z"'�v��9^m��=���u^��;źu��n�3�HaX�R=�83�y{s�q{���-R�!�lL�?/,���=&�W����H]=v�����j�Q��^���<�"5�'C�HT�Nr.���Иh�MR�8f�%c���xǐ��E�2�4�h�Ӕi����2�t���,�V��V*�IFyZ�dFZ)���+��c&0Ai��rQ���r�ZE����3c9�V��A��T1�)˘0�E^�A�W`b,g@�@�;F1��u�D�f���Y	S47,z�'�wx���A�@/la �t�}�'A�ޗӭ=���Tċ4")F\eLA����/�>����.,פə�W�c��p2�8M����jl<��{fZ�J~W��1���1��U8�k)0�+NCe�cV�CS�k{�A���?�N�����k��D^oTk��W��)���l��I�4��xd �@Z,��r��A 6��X��r�.C,"g\�)E.ي��Q��
����
�����"x�;����"6�ubC�a���ŝķaMч���	�5&J����U�I=��0��}��_�{!n��r�T��j�m      �   �   x���;R�0Ekyl �'Y���������
��-5]��%`�d&f��3�s���z/ �nh��/�o �3�	OD��Q2�f����	��Z(�Z�mB]��A�ǧ5��W W�7,7�`"��.���Y�%��.�ݢ�!w�+����f)�Rv[����y�d1*̄��S0����$R��~9Qv7#)�]����]����P�A�[�oG�v~3Om�1n�ᮎ����v�������gY�ᘝ|      �      x������ � �      �   �   x�u�K�0 �p�w�+��l�$.�ĵ�R
�Xjx|=���b���f6���l'	w�s�Qf~���z:�/ǃWi�uy#A�kӀ�+�6���d��L��^;yF"�$�-0��M�D��^Y�BW�<�����y���l���E,�.�1+�������>~      �   �  x�}нv�@�zx
ې3��@�QcP�!Yid�A ��_�)�&9���^��,g��*%��\��RƋ2��gě�˲��>�DV�h(C,�0i]}V�K��j�nS�*�7Wk���{��̳xq���+�pP��!��^���xj/Vh�����F+��/�D@{ u�5�H�DD��r�}�����aZ�]�Xٞ2>j���	��W�?5ֲ(����q��wG~k���;3����%�9ԶI�=��4�߈&��ƚ��������e�;����T���&�F�?5v��O#�g��c2
�,?��x�3罰����6���6=�9��w��7��,<�M������9t�B,���(+;^�m�X7@5 D���v`C�z�$|�� �Mk�*     