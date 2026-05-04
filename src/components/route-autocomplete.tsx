"use client";

import { useMemo, useState } from "react";
import { popularRouteOptions, routeGroups, routeOptions } from "@/lib/data";
import type { Locale } from "@/lib/locale";

type RouteAutocompleteProps = {
  locale: Locale;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  className?: string;
};

const groupLabels: Record<Locale, Record<(typeof routeGroups)[number]["id"], string>> = {
  es: {
    "maldonado-coast": "Costa de Maldonado",
    "maldonado-inland": "Maldonado y cercanias",
    "east-uruguay": "Este del Uruguay",
    "montevideo-area": "Montevideo y area metropolitana",
    "uruguay-cities": "Ciudades principales del Uruguay",
  },
  fr: {
    "maldonado-coast": "Cote de Maldonado",
    "maldonado-inland": "Maldonado et alentours",
    "east-uruguay": "Est de l'Uruguay",
    "montevideo-area": "Montevideo et zone metropolitaine",
    "uruguay-cities": "Grandes villes d'Uruguay",
  },
};

const uiCopy: Record<Locale, { popular: string; suggestions: string; empty: string }> = {
  es: {
    popular: "Mas usados",
    suggestions: "Sugerencias",
    empty: "No hay resultados para esta busqueda.",
  },
  fr: {
    popular: "Les plus utilises",
    suggestions: "Suggestions",
    empty: "Aucun resultat pour cette recherche.",
  },
};

export function RouteAutocomplete({ locale, value, defaultValue, onValueChange, placeholder, className }: RouteAutocompleteProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const query = (isControlled ? value : internalValue) ?? "";
  const lowerQuery = query.trim().toLowerCase();
  const activeQuery = isOpen && isFiltering ? lowerQuery : "";
  const copy = uiCopy[locale];

  const filteredGroups = useMemo(() => {
    if (!activeQuery) {
      return routeGroups.map((group) => ({
        id: group.id,
        label: groupLabels[locale][group.id],
        options: group.options.slice(0, 6),
      }));
    }

    return routeGroups
      .map((group) => ({
        id: group.id,
        label: groupLabels[locale][group.id],
        options: group.options.filter((option) => option.toLowerCase().includes(activeQuery)).slice(0, 6),
      }))
      .filter((group) => group.options.length > 0);
  }, [activeQuery, locale]);

  const filteredPopular = useMemo(() => {
    if (!activeQuery) {
      return popularRouteOptions;
    }

    return popularRouteOptions.filter((option) => option.toLowerCase().includes(activeQuery));
  }, [activeQuery]);

  function setNextValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  return (
    <div className={className}>
      <input
        type="text"
        value={query}
        list=""
        placeholder={placeholder}
        onFocus={() => {
          setIsOpen(true);
          setIsFiltering(false);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false);
            setIsFiltering(false);
          }, 120);
        }}
        onChange={(event) => {
          setIsFiltering(true);
          setNextValue(event.target.value);
          setIsOpen(true);
        }}
        className="mt-3 w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
      />

      {isOpen ? (
        <div className="mt-4 space-y-4 rounded-[24px] border border-[var(--uy-line)] bg-white p-4 shadow-[0_20px_45px_-35px_rgba(19,89,135,0.35)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--uy-deep)]">{copy.popular}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredPopular.map((option) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setNextValue(option);
                    setIsOpen(false);
                  }}
                  className="rounded-full bg-[var(--uy-sky-pale)] px-3 py-2 text-xs font-semibold text-[var(--uy-deep)] transition hover:bg-[var(--uy-sky-soft)]"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{copy.suggestions}</p>
            <div className="mt-3 space-y-3">
              {filteredGroups.length === 0 ? (
                <p className="text-sm text-slate-500">{copy.empty}</p>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setNextValue(option);
                            setIsOpen(false);
                          }}
                          className={[
                            "rounded-full border px-3 py-2 text-xs transition",
                            query === option
                              ? "border-[var(--uy-deep)] bg-[var(--uy-deep)] text-[var(--uy-paper)]"
                              : "border-[color:rgba(19,89,135,0.18)] text-slate-600 hover:border-[var(--uy-deep)] hover:text-[var(--uy-deep)]",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {!routeOptions.includes(query) && activeQuery ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{copy.suggestions}: {routeOptions.filter((option) => option.toLowerCase().includes(activeQuery)).slice(0, 3).join(" · ") || copy.empty}</p>
      ) : null}
    </div>
  );
}