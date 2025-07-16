'use client';

import React from 'react';
import PhoneInputComponent from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Entrez votre numéro de téléphone",
  disabled = false,
  required = false,
  className = "",
  name,
  id
}) => {
  return (
    <PhoneInputComponent
      country={'fr'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      inputProps={{
        name: name,
        id: id,
        required: required,
        className: `phone-input-field ${className}`,
      }}
      containerClass="phone-input-container"
      inputClass="phone-input-field"
      buttonClass="phone-input-button"
      dropdownClass="phone-input-dropdown"
      searchClass="phone-input-search"
      enableSearch={true}
      disableSearchIcon={false}
      countryCodeEditable={false}
      specialLabel=""
      searchPlaceholder="Rechercher un pays..."
      searchNotFound="Aucun pays trouvé"
      copyNumbersOnly={false}
      priority={{
        fr: 0,
        be: 1,
        ch: 2,
        ca: 3,
        us: 4,
        gb: 5
      }}
      preferredCountries={['fr', 'be', 'ch', 'ca', 'us', 'gb']}
      localization={{
        fr: 'France',
        be: 'Belgique',
        ch: 'Suisse',
        ca: 'Canada',
        us: 'États-Unis',
        gb: 'Royaume-Uni',
        de: 'Allemagne',
        es: 'Espagne',
        it: 'Italie',
        pt: 'Portugal',
        ma: 'Maroc',
        dz: 'Algérie',
        tn: 'Tunisie',
        sn: 'Sénégal',
        ci: 'Côte d\'Ivoire',
        cm: 'Cameroun',
        bf: 'Burkina Faso',
        ml: 'Mali',
        ne: 'Niger',
        td: 'Tchad',
        ga: 'Gabon',
        cg: 'Congo',
        cd: 'République démocratique du Congo'
      }}
    />
  );
};

export default PhoneInput; 