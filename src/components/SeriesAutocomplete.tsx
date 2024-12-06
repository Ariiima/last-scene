import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

interface SeriesAutocompleteProps {
  onSelect: (series: string) => void;
}

export function SeriesAutocomplete({ onSelect }: SeriesAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const searchSeries = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: inputValue }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        } else if (data.error) {
          console.error('API error:', data.error);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(searchSeries, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue]);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    onSelect(currentValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          placeholder="Type a series name..."
          aria-label="Search for series"
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-gray-800 border border-gray-700" align="start">
        <Command className="bg-transparent">
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9 bg-transparent text-white"
            placeholder="Type a series name..."
          />
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
              No series found.
            </CommandEmpty>
          )}
          <CommandGroup className="text-white">
            {suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion}
                value={suggestion}
                onSelect={handleSelect}
                className="cursor-pointer hover:bg-gray-700"
              >
                {suggestion}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 