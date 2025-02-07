import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Label } from "./label";
import { useDebouncedCallback } from "use-debounce";

interface AddressPickerProps {
  defaultValue?: string;
  onAddressSelect: (address: string, city: string) => void;
  apiKey: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesResponse {
  predictions: Prediction[];
  error?: {
    message: string;
  };
}

export function AddressPicker({ defaultValue = "", onAddressSelect, apiKey }: AddressPickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}&key=${apiKey}`
      );
      const data: PlacesResponse = await response.json();

      if (data.error) {
        setError(data.error.message);
        setPredictions([]);
      } else {
        setPredictions(data.predictions || []);
      }
    } catch (err) {
      setError("Failed to fetch suggestions");
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `/api/places/details?place_id=${placeId}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error.message || "Failed to fetch place details");
        return null;
      }

      return data.result;
    } catch (err) {
      setError("Failed to fetch place details");
      return null;
    }
  };

  const handleSelect = async (placeId: string, description: string) => {
    setValue(description);
    setInputValue(description);
    setOpen(false);

    const details = await getPlaceDetails(placeId);
    if (details) {
      const city = details.address_components.find(
        (component: any) => component.types.includes("locality")
      )?.long_name || "";
      
      onAddressSelect(details.formatted_address, city);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Address</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">
                {value || "Search for an address..."}
              </span>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Type to search..."
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value);
                debouncedSearch(value);
              }}
            />
            <CommandList>
              {error ? (
                <p className="p-2 text-sm text-red-500">{error}</p>
              ) : loading ? (
                <CommandEmpty>Searching...</CommandEmpty>
              ) : predictions.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {predictions.map((prediction) => (
                    <CommandItem
                      key={prediction.place_id}
                      value={prediction.description}
                      onSelect={() => handleSelect(prediction.place_id, prediction.description)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">
                          {prediction.structured_formatting.main_text}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === prediction.description
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 