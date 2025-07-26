'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { COUNTRIES_DATA } from '../utils/validation';
import { CountryData } from '@/api/auth/types';

type PrefixType = 'phone' | 'vat';

interface FlexibleCountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  type: PrefixType;
  disabled?: boolean;
  placeholder?: string;
}

export default function FlexibleCountrySelector({
  value,
  onValueChange,
  type,
  disabled = false,
  placeholder
}: FlexibleCountrySelectorProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedCountry = COUNTRIES_DATA.find(
    (country) => country.code === value
  );

  const getDisplayPrefix = (country: CountryData) => {
    return type === 'phone' ? country.phonePrefix : country.vatPrefix;
  };

  const getDefaultPlaceholder = () => {
    return type === 'phone'
      ? t('Registration.selectCountryCode')
      : t('Registration.selectVatCountry');
  };

  const filteredCountries = useMemo(() => {
    // Filter out countries that don't have the required prefix type
    const countriesWithPrefix = COUNTRIES_DATA.filter((country) => {
      const prefix = getDisplayPrefix(country);
      return prefix && prefix.length > 0;
    });

    if (!searchValue) return countriesWithPrefix;

    const search = searchValue.toLowerCase();
    return countriesWithPrefix.filter(
      (country) =>
        country.country.toLowerCase().includes(search) ||
        country.code.toLowerCase().includes(search) ||
        getDisplayPrefix(country)?.toLowerCase().includes(search)
    );
  }, [searchValue, type]);

  const handleSelect = (countryCode: string) => {
    onValueChange(countryCode);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className='w-full justify-between font-normal'
        >
          <div className='flex items-center gap-2'>
            {selectedCountry ? (
              <>
                <span className='text-lg'>{selectedCountry.flag}</span>
                <span
                  className={cn(
                    'text-sm',
                    type === 'phone' ? 'font-mono' : 'font-semibold'
                  )}
                >
                  {getDisplayPrefix(selectedCountry)}
                </span>
              </>
            ) : (
              <span className='text-muted-foreground'>
                {placeholder || getDefaultPlaceholder()}
              </span>
            )}
          </div>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <div className='flex items-center border-b px-3'>
          <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
          <Input
            placeholder={t('Registration.searchCountry')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className='flex h-11 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </div>
        <div className='max-h-64 overflow-y-auto'>
          {filteredCountries.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              {t('Registration.noCountryFound')}
            </div>
          ) : (
            <div className='p-1'>
              {filteredCountries.map((country) => {
                const displayPrefix = getDisplayPrefix(country);
                if (!displayPrefix) return null;

                return (
                  <div
                    key={country.code}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      value === country.code &&
                        'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleSelect(country.code)}
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-3'>
                      <span className='flex-shrink-0 text-lg'>
                        {country.flag}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <div className='truncate font-medium'>
                          {country.country}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'flex-shrink-0 text-sm text-muted-foreground',
                          type === 'phone' ? 'font-mono' : 'font-semibold'
                        )}
                      >
                        {displayPrefix}
                      </span>
                    </div>
                    {value === country.code && (
                      <Check className='ml-2 h-4 w-4 flex-shrink-0' />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
