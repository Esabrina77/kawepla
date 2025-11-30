'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns } from '@/hooks/useDesigns';
import { Design } from '@/types';
import DesignPreview from '@/components/DesignPreview';
import { HeaderMobile } from '@/components/HeaderMobile';
import { Heart, PaintBucket } from 'lucide-react';
import styles from './page.module.css';

export default function DesignDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { getDesignById } = useDesigns();
    const [design, setDesign] = useState<Design | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const loadDesign = async () => {
            try {
                setLoading(true);
                const data = await getDesignById(params.id);
                setDesign(data);

                // Check favorites from local storage
                const favorites = JSON.parse(localStorage.getItem('favoriteDesigns') || '[]');
                setIsFavorite(favorites.includes(params.id));
            } catch (error) {
                console.error('Error loading design:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDesign();
    }, [params.id, getDesignById]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favoriteDesigns') || '[]');
        let newFavorites;

        if (isFavorite) {
            newFavorites = favorites.filter((id: string) => id !== params.id);
        } else {
            newFavorites = [...favorites, params.id];
        }

        localStorage.setItem('favoriteDesigns', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    const handlePersonalize = () => {
        if (!design) return;

        if (design.isTemplate) {
            // Créer une nouvelle personnalisation à partir du modèle
            router.push(`/client/design/editor?templateId=${design.id}`);
        } else {
            // Éditer le design existant
            router.push(`/client/design/editor?designId=${design.id}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Chargement du design...</div>;
    }

    if (!design) {
        return (
            <div className={styles.error}>
                <h2>Design introuvable</h2>
                <button onClick={() => router.back()} className={styles.secondaryButton}>
                    Retour
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <HeaderMobile 
                title={design.name}
                onBack={() => router.push('/client/design')}
            />

            <main className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.previewSection}>
                        <DesignPreview
                            design={design}
                            width={500}
                            height={700}
                        />
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.header}>
                            {design.category && (
                                <span className={styles.category}>{design.category}</span>
                            )}
                            <h1 className={styles.title}>{design.name}</h1>
                            <div className={styles.priceType}>
                                {design.priceType === 'FREE' ? 'Gratuit' :
                                    design.priceType === 'ESSENTIAL' ? 'Essentiel' :
                                        design.priceType === 'ELEGANT' ? 'Élégant' : 'Luxe'}
                            </div>
                        </div>

                        <p className={styles.description}>{design.description}</p>

                        {design.tags && design.tags.length > 0 && (
                            <div className={styles.tags}>
                                {design.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                onClick={handlePersonalize}
                                className={styles.primaryButton}
                            >
                                <PaintBucket size={20} />
                                {design.isTemplate ? 'Personnaliser ce modèle' : 'Modifier ce design'}
                            </button>

                            <button
                                onClick={toggleFavorite}
                                className={`${styles.secondaryButton} ${isFavorite ? styles.active : ''}`}
                            >
                                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                                {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
