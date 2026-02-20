import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEBOUNCE_MS = 300;

const IndiaAddressForm = ({ value, onChange, required = false }) => {
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [stateQuery, setStateQuery] = useState(value.state || '');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const [cityQuery, setCityQuery] = useState(value.city || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [selectedStateCode, setSelectedStateCode] = useState(null);

  // Fetch states once
  useEffect(() => {
    const fetchStates = async () => {
      setStatesLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/locations/states`);
        setStates(res.data || []);
      } catch (err) {
        console.error('Failed to load states', err);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Keep local stateQuery/cityQuery in sync with external value
  useEffect(() => {
    setStateQuery(value.state || '');
  }, [value.state]);

  useEffect(() => {
    setCityQuery(value.city || '');
  }, [value.city]);

  // Derive selectedStateCode from current value/state list
  useEffect(() => {
    if (!value.state || states.length === 0) {
      setSelectedStateCode(null);
      return;
    }
    const match = states.find(
      (s) => s.name.toLowerCase() === value.state.toLowerCase()
    );
    setSelectedStateCode(match ? match.code : null);
  }, [value.state, states]);

  const filteredStates = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter((s) => s.name.toLowerCase().includes(q));
  }, [states, stateQuery]);

  // Debounced city suggestions
  useEffect(() => {
    if (!selectedStateCode) {
      setCitySuggestions([]);
      return;
    }
    const q = cityQuery.trim();
    if (!q) {
      setCitySuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      setCityLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/locations/cities`,
          {
            params: {
              state_code: selectedStateCode,
              q,
              limit: 20,
            },
          }
        );
        setCitySuggestions(res.data || []);
      } catch (err) {
        console.error('Failed to load cities', err);
        setCitySuggestions([]);
      } finally {
        setCityLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [selectedStateCode, cityQuery]);

  const handleStateSelect = (state) => {
    setStateQuery(state.name);
    setSelectedStateCode(state.code);
    setShowStateDropdown(false);
    // Clear city when state changes
    onChange({
      ...value,
      state: state.name,
      city: '',
    });
  };

  const handleCitySelect = (city) => {
    setCityQuery(city.name);
    setShowCityDropdown(false);
    onChange({
      ...value,
      city: city.name,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-earth mb-2">
          Address{required ? ' *' : ''}
        </label>
        <textarea
          value={value.address}
          onChange={(e) =>
            onChange({
              ...value,
              address: e.target.value,
            })
          }
          className="w-full"
          rows="3"
          required={required}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-earth mb-2">
            State{required ? ' *' : ''}
          </label>
          <input
            type="text"
            value={stateQuery}
            onChange={(e) => {
              setStateQuery(e.target.value);
              setShowStateDropdown(true);
            }}
            onFocus={() => setShowStateDropdown(true)}
            className="w-full"
            autoComplete="off"
            required={required}
          />
          {showStateDropdown && (
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-earth/20 bg-white shadow-lg">
              {statesLoading ? (
                <div className="px-3 py-2 text-sm text-earth/60">
                  Loading states...
                </div>
              ) : filteredStates.length === 0 ? (
                <div className="px-3 py-2 text-sm text-earth/60">
                  No states found
                </div>
              ) : (
                filteredStates.map((state) => (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => handleStateSelect(state)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-forest/5"
                  >
                    {state.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-earth mb-2">
            City{required ? ' *' : ''}
          </label>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            className="w-full"
            autoComplete="off"
            disabled={!selectedStateCode}
            required={required}
          />
          {showCityDropdown && selectedStateCode && (
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-earth/20 bg-white shadow-lg">
              {cityLoading ? (
                <div className="px-3 py-2 text-sm text-earth/60">
                  Loading cities...
                </div>
              ) : citySuggestions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-earth/60">
                  {cityQuery.trim()
                    ? 'No matching cities for this state'
                    : 'Start typing to search cities'}
                </div>
              ) : (
                citySuggestions.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-forest/5"
                  >
                    {city.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-earth mb-2">
            Pincode{required ? ' *' : ''}
          </label>
          <input
            type="text"
            value={value.pincode}
            onChange={(e) =>
              onChange({
                ...value,
                pincode: e.target.value,
              })
            }
            className="w-full"
            required={required}
          />
        </div>
      </div>
    </div>
  );
};

export default IndiaAddressForm;

