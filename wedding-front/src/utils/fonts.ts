export const GOOGLE_FONTS = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Oswald',
    'Source Sans Pro',
    'Slabo 27px',
    'Raleway',
    'PT Sans',
    'Merriweather',
    'Nunito',
    'Playfair Display',
    'Rubik',
    'Pacifico',
    'Dancing Script',
    'Great Vibes',
    'Lobster',
    'Satisfy',
    'Poppins',
    'Noto Sans',
    'Inter',
    'Ubuntu',
    'Roboto Condensed',
    'Roboto Mono',
    'Lora',
    'Work Sans',
    'Mukta',
    'Quicksand',
    'Inconsolata',
    'Nunito Sans',
    'Barlow',
    'PT Serif',
    'Hind',
    'Heebo',
    'Libre Franklin',
    'DM Sans',
    'Crimson Text',
    'Josefin Sans',
    'Karla',
    'Arimo',
    'Dosis',
    'Libre Baskerville',
    'Anton',
    'Bitter',
    'Cabin',
    'Oxygen',
    'Fira Sans',
    'Arvo',
    'Bree Serif',
    'Fjalla One',
    'Acme',
    'Righteous',
    'Ubuntu Mono',
    'Merriweather Sans',
    'Varela Round',
    'Asap',
    'Signika',
    'Catamaran',
    'Questrial',
    'Exo 2',
    'Maven Pro',
    'Cairo',
    'Rokkitt',
    'Muli',
    'Cuprum',
    'Francois One',
    'Archivo Narrow',
    'Abel',
    'Barlow Condensed',
    'Prompt',
    'Shadows Into Light',
    'Amatic SC',
    'Abril Fatface',
    'Comfortaa',
    'Permanent Marker',
    'Patrick Hand',
    'Fredoka One',
    'Alfa Slab One',
    'Cookie',
    'Sacramento',
    'Yellowtail',
    'Monoton',
    'Creepster',
    'Bangers',
    'Audiowide',
    'Luckiest Guy',
    'Russo One',
    'Press Start 2P',
    'Ultra',
    'Chewy',
    'Changa One',
    'Passion One',
    'Black Ops One',
    'Carter One',
    'Sigmar One',
    'Special Elite',
    'Love Ya Like A Sister'
];

export const loadFonts = (fonts: string[]) => {
    const CHUNK_SIZE = 20;
    const chunks = [];

    for (let i = 0; i < fonts.length; i += CHUNK_SIZE) {
        chunks.push(fonts.slice(i, i + CHUNK_SIZE));
    }

    chunks.forEach((chunk, index) => {
        const href = `https://fonts.googleapis.com/css2?family=${chunk.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;

        // Vérifier si ce chunk est déjà chargé
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.href = href;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    });
};

