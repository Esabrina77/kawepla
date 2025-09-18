'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesigns, CreateDesignData } from '@/hooks/useDesigns';
import { Save, Upload, Palette, Type } from 'lucide-react';
import { uploadToFirebase } from '@/lib/firebase';
import { TemplateEngine, getDefaultInvitationData, getDefaultElements } from '@/lib/templateEngine';
import styles from './create.module.css';

// Polices disponibles - Toutes les polices du dossier fonts
const AVAILABLE_FONTS = {
  'Great Vibes': 'Great Vibes, cursive',
  'Montserrat': 'Montserrat, sans-serif',
  'Poppins': 'Poppins, sans-serif',
  'Featherscript': 'Featherscript, cursive',
  'Harrington': 'Harrington, cursive',
  'OpenDyslexic': 'OpenDyslexic, sans-serif',
  'Bride': 'Bride, cursive',
  'FFF Tusj': 'FFF Tusj, cursive',
  'Kalam': 'Kalam, handwriting',
  'Windsong': 'Windsong, cursive',
  'Alex Brush': 'Alex Brush, cursive',
  'Miama': 'Miama, cursive',
  'Blackjack': 'Blackjack, display',
  'League Script': 'League Script, cursive',
  'Daisy': 'Daisy, handwriting'
};

// Polices disponibles par catégorie
const FONT_CATEGORIES = {
  elegant: ['Great Vibes', 'Dancing Script', 'Pacifico', 'Featherscript'],
  modern: ['Montserrat', 'Poppins', 'Inter', 'OpenDyslexic'],
  classic: ['Playfair Display', 'Cormorant Garamond', 'Harrington'],
  handwritten: ['Kalam', 'Caveat', 'Indie Flower', 'Bride']
};

// Template simplifié pour la prévisualisation
const SIMPLE_TEMPLATE = {
  layout: '<div class="invitation">{content}</div>',
  sections: {
    content: {
      html: `
        <div class="invitation-container">
          <div class="element-title positionable-element">{eventTitle}</div>
          <div class="element-customText positionable-element">{customText}</div>
          <div class="element-eventDate positionable-element">{eventDate}</div>
          <div class="element-eventTime positionable-element">{eventTime}</div>
          <div class="element-location positionable-element">{location}</div>
          <div class="element-moreInfo positionable-element">{moreInfo}</div>
        </div>
      `,
      position: 'content'
    }
  }
};


export default function CreateDesignPage() {
  const router = useRouter();
  const { createDesign } = useDesigns();
  
  // Ajouter les polices CSS pour la prévisualisation
  useEffect(() => {
    const fontCSS = `
      @font-face {
        font-family: 'Featherscript';
        src: url('/fonts/featherscript.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Harrington';
        src: url('/fonts/harrington.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('/fonts/opendyslexic.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Great Vibes';
        src: url('/fonts/greatvibes.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Montserrat';
        src: url('/fonts/montserrat.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Poppins';
        src: url('/fonts/poppins.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Bride';
        src: url('/fonts/Bride.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'FFF Tusj';
        src: url('/fonts/fff_tusj.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Kalam';
        src: url('/fonts/kalam.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Windsong';
        src: url('/fonts/windsong.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Alex Brush';
        src: url('/fonts/alexbrush.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Miama';
        src: url('/fonts/miama.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Blackjack';
        src: url('/fonts/blackjack.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'League Script';
        src: url('/fonts/league-script.league-script.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Daisy';
        src: url('/fonts/daisy.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = fontCSS;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [designName, setDesignName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('minimaliste');
  const [eventType, setEventType] = useState<'event' | 'BIRTHDAY' | 'BAPTISM' | 'ANNIVERSARY' | 'CORPORATE'>('event');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [elements, setElements] = useState<any[]>(() => getDefaultElements(eventType));
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [priceType, setPriceType] = useState<'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'LUXE'>('FREE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour les éléments quand le type d'événement change
  useEffect(() => {
    setElements(getDefaultElements(eventType));
  }, [eventType]);

  // Fonction pour mettre à jour un élément
  const updateElement = (elementId: string, updates: any) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  // Fonction pour obtenir un élément sélectionné
  const getSelectedElement = () => {
    return elements.find(el => el.id === selectedElement);
  };

  // Fonction pour obtenir toutes les polices disponibles
  const getAllFonts = () => {
    return Object.keys(AVAILABLE_FONTS);
  };

  // Nettoyer les URLs blob quand le composant se démonte
  useEffect(() => {
    return () => {
      if (uploadedImageUrl && uploadedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  // Créer le design de prévisualisation moderne
  const createPreviewDesign = () => {
    if (!uploadedImageUrl) return null;
    
    // Générer les styles pour chaque élément positionnable pour la prévisualisation
    const elementStyles: Record<string, Record<string, string>> = {};
    elements.forEach(element => {
      const elementSelector = `.element-${element.id}`;
      elementStyles[elementSelector] = {
        position: 'absolute',
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: 'translate(-50%, -50%)',
        'word-wrap': 'break-word',
        hyphens: 'auto',
        ...(element.position.width && { width: `${element.position.width}%` }),
        ...(element.position.height && { height: `${element.position.height}%` }),
        ...(element.styles.fontSize && { 'font-size': element.styles.fontSize }),
        ...(element.styles.fontFamily && { 'font-family': element.styles.fontFamily }),
        ...(element.styles.color && { color: element.styles.color }),
        ...(element.styles.textAlign && { 'text-align': element.styles.textAlign }),
        ...(element.styles.fontWeight && { 'font-weight': element.styles.fontWeight }),
        ...(element.styles.fontStyle && { 'font-style': element.styles.fontStyle }),
        ...(element.styles.lineHeight && { 'line-height': element.styles.lineHeight }),
        ...(element.styles.letterSpacing && { 'letter-spacing': element.styles.letterSpacing }),
        ...(element.styles.textTransform && { 'text-transform': element.styles.textTransform }),
        ...(element.styles.opacity && { opacity: element.styles.opacity.toString() }),
        ...(element.styles.zIndex && { 'z-index': element.styles.zIndex.toString() })
      };
    });
    
    return {
      id: 'preview',
      template: SIMPLE_TEMPLATE,
      styles: {
        base: {
          '.invitation': {
            'background-image': `url(${uploadedImageUrl})`,
            'background-size': 'contain',
            'background-position': 'center',
            'background-repeat': 'no-repeat',
            'width': '100%',
            'max-width': '600px',
            'aspect-ratio': '21/29.7',
            'position': 'relative',
            'margin': '2% auto',
            'border-radius': '12px',
            'box-shadow': '0 8px 32px rgba(0,0,0,0.12)',
            'overflow': 'hidden'
          },
          '.invitation-container': {
            'width': '100%',
            'height': '100%',
            'position': 'relative'
          },
          '.positionable-element': {
            'position': 'absolute',
            'word-wrap': 'break-word',
            'hyphens': 'auto',
            'user-select': 'none'
          }
        },
        components: {
          'positionable-elements': elementStyles
        },
        animations: {}
      },
      variables: {
        colors: {
              primary: '#2c2c2c',
              secondary: '#555555',
              accent: '#666666',
          background: uploadedImageUrl
        },
        typography: {
          headingFont: 'Great Vibes, cursive',
              bodyFont: 'Montserrat, sans-serif',
          fontSize: {
            base: '16px',
            heading: {
              h1: '48px',
              h2: '22px',
              h3: '18px'
            }
          }
        },
        spacing: {
          base: '1rem',
          sections: '2rem',
          components: '1.5rem'
        }
      },
      // Ajouter les éléments positionnables
      elements
    };
  };

  // Créer un design temporaire pour la prévisualisation avec useMemo pour recalculer à chaque changement
  const previewDesign = useMemo(() => {
    return createPreviewDesign();
  }, [uploadedImageUrl, elements, eventType]);

  // Générer le HTML à chaque changement
  const previewHTML = useMemo(() => {
    if (!uploadedImageUrl || !previewDesign) return '';
    
    const defaultData = getDefaultInvitationData();
    const invitationData = {
      ...defaultData,
      elements
    };
    
    return new TemplateEngine().render(previewDesign, invitationData);
  }, [uploadedImageUrl, previewDesign, elements]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer une URL blob temporaire pour la prévisualisation
      const tempUrl = URL.createObjectURL(file);
      setUploadedImageUrl(tempUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const fileName = `canvas/background_${timestamp}_${selectedFile.name}`;
      
      const downloadURL = await uploadToFirebase(selectedFile, fileName);
      
      // Remplacer l'URL blob par l'URL Firebase
      setUploadedImageUrl(downloadURL);
      
      // Nettoyer l'URL blob temporaire
      if (uploadedImageUrl && uploadedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      
      alert('Image uploadée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour les styles d'un élément
  const updateElementStyle = (property: string, value: string) => {
    if (!selectedElement) return;
    
    updateElement(selectedElement, {
      styles: {
        ...getSelectedElement()?.styles,
          [property]: value
        }
    });
  };

  // Fonction pour mettre à jour la position d'un élément
  const updateElementPosition = (property: string, value: number) => {
    if (!selectedElement) return;
    
    updateElement(selectedElement, {
      position: {
        ...getSelectedElement()?.position,
        [property]: value
      }
    });
  };


  const handleSave = async () => {
    if (!designName.trim()) {
      alert('Veuillez saisir un nom pour le design');
      return;
    }

    if (!uploadedImageUrl) {
      alert('Veuillez uploader une image de fond');
      return;
    }

    // Vérifier si c'est une URL blob et demander l'upload Firebase
    if (uploadedImageUrl.startsWith('blob:')) {
      alert('Veuillez d\'abord uploader l\'image vers Firebase en cliquant sur "Uploader"');
      return;
    }

    setIsLoading(true);
    try {
      // Générer les styles pour chaque élément positionnable
      const elementStyles: Record<string, Record<string, string>> = {};
      elements.forEach(element => {
        const elementSelector = `.element-${element.id}`;
        elementStyles[elementSelector] = {
          position: 'absolute',
          left: `${element.position.x}%`,
          top: `${element.position.y}%`,
          transform: 'translate(-50%, -50%)',
          'word-wrap': 'break-word',
          hyphens: 'auto',
          ...(element.position.width && { width: `${element.position.width}%` }),
          ...(element.position.height && { height: `${element.position.height}%` }),
          ...(element.styles.fontSize && { 'font-size': element.styles.fontSize }),
          ...(element.styles.fontFamily && { 'font-family': element.styles.fontFamily }),
          ...(element.styles.color && { color: element.styles.color }),
          ...(element.styles.textAlign && { 'text-align': element.styles.textAlign }),
          ...(element.styles.fontWeight && { 'font-weight': element.styles.fontWeight }),
          ...(element.styles.fontStyle && { 'font-style': element.styles.fontStyle }),
          ...(element.styles.lineHeight && { 'line-height': element.styles.lineHeight }),
          ...(element.styles.letterSpacing && { 'letter-spacing': element.styles.letterSpacing }),
          ...(element.styles.textTransform && { 'text-transform': element.styles.textTransform }),
          ...(element.styles.opacity && { opacity: element.styles.opacity.toString() }),
          ...(element.styles.zIndex && { 'z-index': element.styles.zIndex.toString() })
        };
      });

      const designData: CreateDesignData = {
        name: designName,
        description: description || `Design ${eventType.toLowerCase()} créé le ${new Date().toLocaleDateString()}`,
        category: category,
        tags: [category, eventType.toLowerCase(), 'moderne', 'positionnable'],
        isActive: true,
        isPremium: priceType !== 'FREE',
        priceType: priceType,
        template: SIMPLE_TEMPLATE,
        styles: {
          base: {
            '.invitation': {
              'background-image': `url(${uploadedImageUrl})`,
              'background-size': 'contain',
              'background-position': 'center',
              'background-repeat': 'no-repeat',
              'width': '100%',
              'max-width': '600px',
              'aspect-ratio': '21/29.7',
              'position': 'relative',
              'margin': '2% auto',
              'border-radius': '12px',
              'box-shadow': '0 8px 32px rgba(0,0,0,0.12)',
              'overflow': 'hidden'
            },
            '.invitation-container': {
              'width': '100%',
              'height': '100%',
              'position': 'relative'
            },
            '.positionable-element': {
              'position': 'absolute',
              'word-wrap': 'break-word',
              'hyphens': 'auto',
              'user-select': 'none'
            }
          },
          components: {
            'positionable-elements': elementStyles
          },
          animations: {}
        },
        variables: {
          colors: {
            primary: '#2c2c2c',
            secondary: '#555555',
            accent: '#666666',
            background: uploadedImageUrl
          },
          typography: {
            headingFont: 'Great Vibes, cursive',
            bodyFont: 'Montserrat, sans-serif',
            fontSize: {
              base: '16px',
              heading: {
                h1: '48px',
                h2: '22px',
                h3: '18px'
              }
            }
          },
          spacing: {
            base: '1rem',
            sections: '2rem',
            components: '1.5rem'
          },
          breakpoints: {
            mobile: '480px',
            tablet: '768px',
            desktop: '1024px'
          }
        },
        backgroundImage: uploadedImageUrl,
        // Ajouter les éléments positionnables
        customFonts: { 
          elements: JSON.stringify(elements)
        }
      };

      console.log('Background URL:', uploadedImageUrl);
      console.log('Sending design data to backend:', JSON.stringify(designData, null, 2));
      await createDesign(designData);
      alert('Design créé avec succès !');
      router.push('/super-admin/design');
    } catch (error) {
      console.error('Erreur lors de la création du design:', error);
      alert('Erreur lors de la création du design. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className={styles.designName}
          placeholder="Nom du design moderne..."
        />
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isLoading}
        >
          <Save size={16} />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Sidebar Moderne */}
        <div className={styles.sidebar}>
          {/* Type d'Événement */}
          <div className={styles.section}>
            <h3>Type d'Événement</h3>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className={styles.select}
            >
              <option value="WEDDING">Mariage</option>
              <option value="BIRTHDAY">Anniversaire</option>
              <option value="BAPTISM">Baptême</option>
              <option value="ANNIVERSARY">Anniversaire de mariage</option>
              <option value="CORPORATE">Événement d'entreprise</option>
              <option value="GRADUATION">Remise de diplôme</option>
              <option value="BABY_SHOWER">Baby shower</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Upload Background */}
          <div className={styles.section}>
            <h3>Image de Fond</h3>
            <div className={styles.uploadArea}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadButton}
              >
                <Upload size={16} />
                Choisir une image
              </button>
              
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className={styles.uploadConfirmButton}
                >
                  {isLoading ? 'Upload...' : 'Uploader'}
                </button>
              )}
            </div>

            {uploadedImageUrl && (
              <div className={styles.uploadedImage}>
                <img src={uploadedImageUrl} alt="Background" />
                <p>✓ Image prête</p>
              </div>
            )}
          </div>

          {/* Éléments */}
          <div className={styles.section}>
            <h3>Éléments de l'Invitation</h3>
            <div className={styles.elementsList}>
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`${styles.elementItem} ${selectedElement === element.id ? styles.selected : ''}`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className={styles.elementName}>
                    {element.id === 'title' ? 'Titre' :
                     element.id === 'customText' ? 'Texte personnalisé' :
                     element.id === 'eventDate' ? 'Date' :
                     element.id === 'eventTime' ? 'Heure' :
                     element.id === 'location' ? 'Lieu' :
                     element.id === 'moreInfo' ? 'Informations supplémentaires' : element.id}
            </div>
              </div>
                ))}
              </div>
            </div>


          {/* Éditeur d'Élément */}
          {selectedElement && getSelectedElement() && (
          <div className={styles.section}>
              <h3>Style de l'Élément</h3>
              <div className={styles.elementEditor}>
                {/* Couleur */}
                <div className={styles.formGroup}>
                  <label>Couleur</label>
                  <div className={styles.colorPicker}>
                    <input
                      type="color"
                      value={getSelectedElement()?.styles.color || '#000000'}
                      onChange={(e) => updateElementStyle('color', e.target.value)}
                      className={styles.colorInput}
                    />
                  </div>
                </div>

                {/* Police */}
                    <div className={styles.formGroup}>
                  <label>Police</label>
                      <select
                    value={getSelectedElement()?.styles.fontFamily || 'Montserrat, sans-serif'}
                    onChange={(e) => updateElementStyle('fontFamily', e.target.value)}
                        className={styles.select}
                      >
                    {Object.entries(AVAILABLE_FONTS).map(([name, value]) => (
                      <option key={name} value={value}>
                        {name}
                          </option>
                        ))}
                      </select>
                    </div>

                {/* Taille */}
                    <div className={styles.formGroup}>
                  <label>Taille</label>
                      <select
                    value={getSelectedElement()?.styles.fontSize || '16px'}
                    onChange={(e) => updateElementStyle('fontSize', e.target.value)}
                        className={styles.select}
                      >
                    <option value="12px">12px - Très petit</option>
                    <option value="14px">14px - Petit</option>
                    <option value="16px">16px - Normal</option>
                    <option value="18px">18px - Moyen</option>
                    <option value="22px">22px - Grand</option>
                    <option value="28px">28px - Très grand</option>
                    <option value="36px">36px - Énorme</option>
                    <option value="48px">48px - Géant</option>
                    <option value="64px">64px - Colossal</option>
                    <option value="72px">72px - Titanesque</option>
                      </select>
                    </div>

                {/* Position */}
                    <div className={styles.formGroup}>
                  <label>Position X (%)</label>
                      <input
                    type="range"
                    min="0"
                    max="100"
                    value={getSelectedElement()?.position.x || 50}
                    onChange={(e) => updateElementPosition('x', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <small>X: {getSelectedElement()?.position.x || 50}%</small>
                    </div>

                    <div className={styles.formGroup}>
                  <label>Position Y (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={getSelectedElement()?.position.y || 50}
                    onChange={(e) => updateElementPosition('y', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <small>Y: {getSelectedElement()?.position.y || 50}%</small>
                    </div>
              </div>
            </div>
                )}

          {/* Paramètres Avancés */}
          <div className={styles.section}>
            <h3>Paramètres</h3>
                <div className={styles.formGroup}>
              <label>Catégorie</label>
                  <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                    className={styles.select}
                  >
                <option value="minimaliste">Minimaliste</option>
                <option value="moderne">Moderne</option>
                <option value="élégant">Élégant</option>
                <option value="luxe">Luxe</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
              <label>Type</label>
                  <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as any)}
                    className={styles.select}
                  >
                <option value="FREE">Gratuit</option>
                <option value="ESSENTIAL">Essentiel</option>
                <option value="ELEGANT">Élégant</option>
                <option value="LUXE">Luxe</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du design..."
                className={styles.textarea}
                rows={3}
              />
                </div>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className={styles.canvasContainer}>
          <div className={styles.canvasWrapper}>
            <div className={styles.canvas}>
              {uploadedImageUrl && previewDesign && previewHTML ? (
                <div 
                  key={`preview-${elements.length}`}
                  className={styles.invitationPreview}
                  dangerouslySetInnerHTML={{
                    __html: previewHTML
                  }}
                />
              ) : (
                <div className={styles.placeholder}>
                  <Upload size={48} />
                  <p>Choisissez une image de fond pour voir la prévisualisation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
