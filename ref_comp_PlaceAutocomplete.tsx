import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (lat: string, lon: string, tz: string, displayName: string) => void;
  placeholder?: string;
  id?: string;
}

/**
 * Resolve the correct UTC offset (in decimal hours) from an IANA timezone string.
 * Uses the Intl.DateTimeFormat API which is available in all modern browsers.
 * Example: "Asia/Kolkata" -> 5.5, "America/New_York" -> -5 or -4 (DST-aware for the epoch date).
 * Falls back to longitude-based approximation if the API is unavailable.
 */
function getUtcOffsetFromIANA(ianaTimezone: string, longitude: number): string {
  try {
    // Use a fixed reference date (no DST confusion for Indian charts)
    // We use the date Jan 1 2000 just to get the standard UTC offset.
    // For accurate historical charts, we use the *birth date* moment.
    // Since we don't have it here, we use the timezone's Jan 1 2000 offset
    // which is correct for non-DST zones (India, most of Asia).
    const refDate = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: ianaTimezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(refDate);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart) {
      // tzPart.value is like "GMT+5:30" or "GMT-5" or "GMT+9"
      const match = tzPart.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const sign = match[1] === "+" ? 1 : -1;
        const hours = Number.parseInt(match[2], 10);
        const minutes = Number.parseInt(match[3] ?? "0", 10);
        const offset = sign * (hours + minutes / 60);
        return offset.toFixed(2);
      }
    }
  } catch {
    // Intl not available or bad timezone string
  }
  // Fallback: longitude-based approximation (nearest 0.5 hour)
  const rawTz = longitude / 15;
  return (Math.round(rawTz * 2) / 2).toFixed(1);
}

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "City, Country",
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=8&language=en&format=json`,
        );
        const data = await res.json();
        const results: GeoResult[] = data.results ?? [];
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(r: GeoResult) {
    const lat = r.latitude.toFixed(4);
    const lon = r.longitude.toFixed(4);
    // Use IANA timezone string for accurate UTC offset (fixes India IST = +5.5, not +5.0)
    const tz = getUtcOffsetFromIANA(r.timezone, r.longitude);
    const displayName = [r.name, r.admin1, r.country]
      .filter(Boolean)
      .join(", ");
    onChange(displayName);
    onSelect(lat, lon, tz, displayName);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {!loading && (
          <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#c8a96e] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((r) => (
            <button
              key={r.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(r);
              }}
            >
              <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#c8a96e]" />
              <span>
                <span className="font-medium">{r.name}</span>
                {r.admin1 && (
                  <span className="text-muted-foreground">, {r.admin1}</span>
                )}
                {r.country && (
                  <span className="text-muted-foreground">, {r.country}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
