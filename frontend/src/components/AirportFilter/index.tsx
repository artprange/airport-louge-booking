import { useEffect, useId, useState, type FormEvent } from 'react';
import { useAirports } from '../../hooks/useAirports';
import type { Airport } from '../../types/airport';
import type { AirportFilterProps } from './types';
import { airportFilterStyles } from './styles';

function AirportFilter({ onApply, autoFocus = false }: AirportFilterProps) {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<Airport | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validationError, setValidationError] = useState('');
  const inputId = useId();
  const listId = `${inputId}-options`;
  const suggestions = useAirports(value, open && !selected);
  const showSuggestions = open && !selected && value.trim().length >= 2;
  const activeAirport = suggestions.airports[activeIndex];

  useEffect(() => {
    if (showSuggestions && activeAirport) {
      document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, activeAirport, listId, showSuggestions]);

  function chooseAirport(airport: Airport) {
    setSelected(airport);
    setValue(airport.iata);
    setOpen(false);
    setActiveIndex(-1);
    setValidationError('');
    onApply(airport.iata);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = selected?.iata ?? value.trim().toUpperCase();
    if (code && !/^[A-Z]{3}$/.test(code)) {
      setValidationError('Choose an airport from the suggestions, or enter a three-letter IATA code.');
      return;
    }
    setValidationError('');
    setOpen(false);
    onApply(code);
  }

  function handleClear() {
    setValue('');
    setSelected(null);
    setOpen(false);
    setActiveIndex(-1);
    setValidationError('');
    onApply('');
  }

  return (
    <form className={airportFilterStyles.form} onSubmit={handleSubmit}>
      <div className={airportFilterStyles.field}>
        <label className={airportFilterStyles.label} htmlFor={inputId}>Airport</label>
        <div className={airportFilterStyles.search}>
          <input id={inputId} name="airport" type="text" role="combobox"
            autoFocus={autoFocus}
            autoComplete="off" spellCheck={false} maxLength={80}
            className={airportFilterStyles.input} value={value}
            placeholder="Search by airport, city or IATA code"
            aria-autocomplete="list" aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listId : undefined}
            aria-activedescendant={showSuggestions && activeAirport ? `${listId}-${activeIndex}` : undefined}
            aria-describedby={`${inputId}-hint${validationError ? ` ${inputId}-error` : ''}`}
            aria-invalid={Boolean(validationError)}
            onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
            onChange={(event) => {
              setValue(event.target.value);
              setSelected(null);
              setActiveIndex(-1);
              setValidationError('');
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                setActiveIndex(-1);
              } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
                const count = suggestions.airports.length;
                if (count) setActiveIndex((index) => event.key === 'ArrowDown'
                  ? (index + 1) % count : (index <= 0 ? count - 1 : index - 1));
              } else if (event.key === 'Enter' && showSuggestions && activeAirport) {
                event.preventDefault();
                chooseAirport(activeAirport);
              }
            }}
          />
          {showSuggestions && (
            <div className={airportFilterStyles.dropdown}>
              <ul id={listId} role="listbox" aria-label="Airport suggestions" className={airportFilterStyles.options}>
                {suggestions.airports.map((airport, index) => (
                  <li key={airport.iata} id={`${listId}-${index}`} role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? airportFilterStyles.activeOption : airportFilterStyles.option}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => chooseAirport(airport)}>
                    <span className={airportFilterStyles.code}>{airport.iata}</span>
                    <span className={airportFilterStyles.optionText}>
                      <span className={airportFilterStyles.airportName}>{airport.name}</span>
                      <span className={airportFilterStyles.location}>
                        {[airport.city, airport.country].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {suggestions.isLoading && <p className={airportFilterStyles.status} role="status">Searching airports…</p>}
              {suggestions.isError && <p className={airportFilterStyles.status} role="status">Airport search is unavailable. Enter a three-letter IATA code to filter directly.</p>}
              {!suggestions.isLoading && !suggestions.isError && suggestions.airports.length === 0 && (
                <p className={airportFilterStyles.status} role="status">No airports with an IATA code found. You can still enter the code directly.</p>
              )}
            </div>
          )}
        </div>
        <p className={airportFilterStyles.hint} id={`${inputId}-hint`}>
          {selected ? selected.name : 'Search worldwide, or enter a three-letter IATA code. Selecting an airport filters the lounges.'}
        </p>
        {validationError && <p className={airportFilterStyles.error} id={`${inputId}-error`} role="alert">{validationError}</p>}
        <p className={airportFilterStyles.credit}>
          Airport data: <a className={airportFilterStyles.link} href="https://freeairportdb.com" target="_blank" rel="noreferrer">FreeAirportDB</a>
          {' · '}<a className={airportFilterStyles.link} href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
        </p>
      </div>
      <button className={airportFilterStyles.submitButton} type="submit">Filter</button>
      <button className={airportFilterStyles.clearButton} type="button" onClick={handleClear}>Clear</button>
    </form>
  );
}

export { AirportFilter };
