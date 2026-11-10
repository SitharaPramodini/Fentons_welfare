import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * Fills a form from the signed-in member's own staff record.
 *
 * The server keys this to the session rather than taking an HRIS parameter,
 * so a member can only ever pre-fill a form with their own details.
 *
 * Only empty fields are written, and only once: someone who has started
 * correcting a value should not have it overwritten when the request lands.
 *
 *   const prefill = usePrefill(form.setValues, {
 *     full_name: "full_name",
 *     nic_number: "nic_number",
 *   });
 */
export function usePrefill(setValues, mapping) {
  const [state, setState] = useState("loading"); // loading | filled | empty | error
  const applied = useRef(false);
  const mappingRef = useRef(mapping);
  mappingRef.current = mapping;

  useEffect(() => {
    let live = true;

    api
      .prefill()
      .then((response) => {
        if (!live || applied.current) return;
        const record = response?.data;

        if (!record?.found) {
          setState("empty");
          return;
        }

        applied.current = true;
        setValues((previous) => {
          const next = { ...previous };
          for (const [field, source] of Object.entries(mappingRef.current)) {
            const value = record[source];
            /* Never overwrite something the person has already typed. */
            const current = String(next[field] ?? "").trim();
            if (!current && value !== null && value !== undefined && value !== "") {
              next[field] = String(value);
            }
          }
          return next;
        });
        setState("filled");
      })
      .catch(() => live && setState("error"));

    return () => {
      live = false;
    };
  }, [setValues]);

  return state;
}
